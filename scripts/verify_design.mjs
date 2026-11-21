import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const appRoot = fileURLToPath(new URL('../webapp', import.meta.url));
const revisionRoot = fileURLToPath(new URL('../docs/design/revisioni', import.meta.url));
// Optional QA dependency lives outside the app; no package.json or lockfile changes.
if (!process.argv[2]) throw new Error('Pass the directory containing the isolated Happy DOM installation.');
const { Window } = await import(pathToFileURL(path.resolve(process.argv[2], 'node_modules/happy-dom/lib/index.js')).href);
process.env.NODE_ENV = 'test';
const win = new Window({ url: 'http://127.0.0.1:5173/' });
for (const key of ['window','document','navigator','location','localStorage','HTMLElement','HTMLInputElement','HTMLDialogElement','Event','MouseEvent','KeyboardEvent','MutationObserver','Node']) {
  Object.defineProperty(globalThis, key, { value: key === 'window' ? win : win[key], configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
win.scrollTo = () => {};
win.HTMLDialogElement.prototype.showModal = function () { this.open = true; this.setAttribute('open',''); };
win.HTMLDialogElement.prototype.close = function () { this.open = false; this.removeAttribute('open'); };
const { createServer } = await import(pathToFileURL(path.join(appRoot, 'node_modules/vite/dist/node/index.js')).href);
const React = await import(pathToFileURL(path.join(appRoot, 'node_modules/react/index.js')).href);
const { createRoot } = await import(pathToFileURL(path.join(appRoot, 'node_modules/react-dom/client.js')).href);
const { act } = React;
const server = await createServer({ root: appRoot, server: {middlewareMode: true}, appType: 'custom' });
const results = [];
let root;
try {
  const { App } = await server.ssrLoadModule('/src/App.tsx');
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.getElementById('root'));
  await act(async () => { root.render(React.createElement(App)); });
  const click = async element => { assert.ok(element, 'Control exists'); await act(async () => { element.click(); }); };
  const byText = text => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === text);
  const inputs = () => [...document.querySelectorAll('.answer-row input')];
  const openBoosters = () => document.querySelector('.booster-toggle');
  const booster = name => [...document.querySelectorAll('.booster-row')].find(b => b.textContent.startsWith(name));
  const draft = () => JSON.parse(localStorage.getItem('aggettivi.demo.v1'));
  const fill = async (index, value) => {
    const input = inputs()[index];
    await act(async () => {
      Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new win.Event('input', { bubbles: true }));
    });
  };
  const check = (label, fn) => { fn(); results.push({ check: label, status: 'pass' }); };
  const submit = async () => { await act(async () => { document.getElementById('turn-form').dispatchEvent(new win.Event('submit', { bubbles:true, cancelable:true })); }); };
  await fs.mkdir(revisionRoot,{recursive:true});
  const snapshot = async (name, cssOverride) => {
    const css = (cssOverride ?? await fs.readFile(path.join(appRoot,'src/styles.css'),'utf8')).replaceAll("url('/fonts/", "url('../../../webapp/public/fonts/");
    const html = '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Anteprima statica DESIGN</title><style>' + css + '</style></head><body>' + document.body.innerHTML.replaceAll('src="/favicon.svg"','src="../../../webapp/public/favicon.svg"') + '</body></html>';
    await fs.writeFile(path.join(revisionRoot,name),html);
  };
  check('Initial: five fields, booster options open per user preference, no selected booster',()=> {
    assert.equal(inputs().length,5);
    assert.equal(openBoosters().getAttribute('aria-expanded'),'true');
    assert.equal(document.getElementById('booster-options').hidden,false);
    assert.match(document.querySelector('.booster-summary').textContent,/Nessun booster/);
  });
  await snapshot('dopo-turno-booster-aperti.html');
  await click(openBoosters());
  await snapshot('dopo-turno-booster-chiusi.html');
  await submit();
  check('Empty submission: error shown and focused, no dialog',()=>{
    assert.match(document.getElementById('turn-error').textContent,/Completa tutti i 5/);
    assert.equal(document.activeElement.id,'turn-error');
    assert.equal(document.querySelector('dialog'),null);
  });
  const five = ['Contabile','Cartaceo','Commerciale','Catastale','Criptato'];
  for (let i=0;i<5;i++) await fill(i,five[i]);
  check('Five fields update the existing local draft format',()=>assert.deepEqual(draft().words.slice(0,5),five));
  await click(openBoosters());
  await click(booster('Estensore'));
  check('Estensore: ten fields and selected summary',()=>{
    assert.equal(inputs().length,10);
    assert.match(document.querySelector('.booster-summary').textContent,/Estensore selezionato · 10/);
  });
  const last = ['Celato','Centrato','Civile','Comunale','Codificato'];
  for(let i=5;i<10;i++) await fill(i,last[i-5]);
  await click(openBoosters());
  await snapshot('dopo-turno-dieci-chiusi.html');
  await click(openBoosters());
  check('Collapse/reopen preserves all ten words and booster',()=>{
    assert.deepEqual(draft().words,[...five,...last]);assert.equal(draft().booster,'E');
    assert.equal(openBoosters().getAttribute('aria-expanded'),'true');
  });
  await click(document.querySelector('[aria-label="Sposta aggettivo 10 in alto"]'));
  check('Reordering position 10 upwards changes order and follows focus',()=>{
    assert.equal(draft().words[8],'Codificato');assert.equal(draft().words[9],'Comunale');
    assert.equal(document.activeElement.id,'word-8');
    assert.match(document.querySelector('[role=status].toast').textContent,/10 alla 9/);
  });
  await click(booster('5su10'));
  check('5su10: ten words retained, one selected booster',()=>{
    assert.equal(inputs().length,10);assert.equal(draft().booster,'5');
    assert.equal(document.querySelectorAll('.booster-row[aria-pressed=true]').length,1);
  });
  await snapshot('dopo-turno-dieci-aperti.html');
  await submit();
  check('Ten-word summary includes ten ordered words and 5su10',()=>{
    assert.equal(document.querySelectorAll('dialog .confirmation-list li').length,10);
    assert.match(document.querySelector('dialog .confirmation-booster').textContent,/5su10/);
  });
  await snapshot('dopo-riepilogo-dieci.html');
  await click(byText('Conferma la prova DEMO'));
  check('Confirm DEMO stores independent receipt without changing data format',()=>{
    assert.equal(draft().receipt.words.length,10);assert.equal(draft().receipt.booster,'5');
    assert.match(draft().receipt.id,/^DEMO-/);assert.equal(document.querySelectorAll('dialog .confirmation-list li').length,10);
    assert.deepEqual(Object.keys(draft()).sort(),['booster','receipt','words']);
  });
  await snapshot('dopo-conferma-dieci.html');
  await click(byText('Torna alla bozza'));
  check('Closing confirmation restores focus to review action',()=>assert.equal(document.activeElement,document.querySelector('.review-action button')));
  await fill(0,'Corretto');
  check('Later edits remain a draft and preserve the previous receipt',()=>{
    assert.match(document.querySelector('.receipt-strip').textContent,/Bozza modificata/);
    assert.equal(draft().receipt.words[0],'Contabile');assert.equal(draft().words[0],'Corretto');
  });
  await click(document.querySelector('.receipt-strip'));
  check('Previous receipt shows original words and explains unconfirmed changes',()=>{
    assert.equal(document.querySelector('dialog .confirmation-list li strong').textContent,'Contabile');
    assert.match(document.querySelector('dialog .draft-notice').textContent,/prova precedente/);
  });
  await click(byText('Torna alla bozza'));
  let warnings=0;
  win.confirm=()=>{warnings++;return false;};
  await click(byText('Rimuovi 5su10'));
  check('Cancel removal preserves ten active fields and booster',()=>assert.equal(draft().booster,'5'));
  win.confirm=()=>{warnings++;return true;};
  await click(byText('Rimuovi 5su10'));
  check('Remove booster returns to five fields, retains hidden words and warns',()=>{
    assert.equal(inputs().length,5);assert.equal(draft().booster,null);assert.equal(warnings,2);
    assert.equal(draft().words[9],'Comunale');
    assert.match(document.querySelector('.booster-summary').textContent,/Nessun booster/);
  });
  await click(booster('Jolly'));
  check('Jolly remains a five-word booster',()=>{assert.equal(inputs().length,5);assert.equal(draft().booster,'J');});
  await click(booster('Top'));
  check('Top replaces Jolly and retains five words',()=>{assert.equal(inputs().length,5);assert.equal(draft().booster,'T');});
  await click(byText('Rimuovi Top'));
  await fill(0,'Bello'); await submit();
  check('Wrong initial is rejected',()=>assert.match(document.getElementById('turn-error').textContent,/lettera C/));
  await fill(0,'cartaceo'); await submit();
  check('Duplicate is rejected',()=>assert.match(document.getElementById('turn-error').textContent,/ripetuto/));
  await fill(0,'Carta bella'); await submit();
  check('Locution is rejected',()=>assert.match(document.getElementById('turn-error').textContent,/locuzioni/));
  await fill(0,'Contabile'); await submit();
  check('Five-word summary remains available after returning from ten',()=>assert.equal(document.querySelectorAll('dialog .confirmation-list li').length,5));
  await click(byText('Conferma la prova DEMO'));
  check('Five-word confirmation replaces the receipt without deleting hidden draft words',()=>{
    assert.equal(draft().receipt.words.length,5);assert.equal(draft().words.length,10);
    assert.equal(draft().receipt.booster,null);assert.equal(draft().words[9],'Comunale');
  });
  await click(byText('Torna alla bozza'));
  await click(openBoosters());
  await snapshot('dopo-turno-cinque-compilati.html');
  await act(async()=>root.unmount());
  localStorage.clear();
  const baselineDirectory = path.join(appRoot,'.sites-runtime','design-baseline');
  await fs.mkdir(baselineDirectory,{recursive:true});
  const baselineRef = process.argv[3] ?? 'ad3d1802278337db115cb64605b10d0553272784';
  const baselineSource = execFileSync('git',['show',`${baselineRef}:webapp/src/App.tsx`],{cwd:appRoot,encoding:'utf8'}).replaceAll("'./lib/game'","'../../src/lib/game'");
  const baselineCss = execFileSync('git',['show',`${baselineRef}:webapp/src/styles.css`],{cwd:appRoot,encoding:'utf8'});
  await fs.writeFile(path.join(baselineDirectory,'App.tsx'),baselineSource);
  const { App: BaselineApp } = await server.ssrLoadModule('/.sites-runtime/design-baseline/App.tsx');
  root = createRoot(document.getElementById('root'));
  await act(async()=>root.render(React.createElement(BaselineApp)));
  await snapshot('prima-turno.html',baselineCss);
  await fs.writeFile(path.join(revisionRoot,'verifiche-dom.json'), JSON.stringify({date:'2026-11-21',baselineRef,environment:'React 19 in Happy DOM, isolated storage; not a real browser or layout engine',checks:results},null,2)+'\n');
  console.log(JSON.stringify({passed:results.length,checks:results},null,2));
} finally {
  if(root) await act(async()=>root.unmount());
  await server.close();
  win.happyDOM.abort();
}
