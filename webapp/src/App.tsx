import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp, Clock3, Expand, FileCheck2, Flag, Home, Info, Layers, ListOrdered, Menu, Settings2, ShieldCheck, Smartphone, Sparkles, Star, Trophy, Users, WandSparkles, WifiOff, X, Zap } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';
import { emptyDraft, moveWord, parseDraft, requiredWords, sameAsReceipt, STORAGE_KEY, validateWords } from './lib/game';
import type { Booster, Draft, Receipt } from './lib/game';

type Page = 'turno' | 'classifica' | 'storico' | 'regole' | 'admin';
type ModalName = 'install' | 'confirm' | 'receipt' | null;
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const nav = [
  { id: 'turno', label: 'Il mio turno', icon: Home },
  { id: 'classifica', label: 'Classifiche', icon: Trophy },
  { id: 'storico', label: 'Le mie giocate', icon: Layers },
  { id: 'regole', label: 'Come si gioca', icon: BookOpen },
] as const;
const boosters = [
  { id: 'J', name: 'Jolly', tag: '×2', text: 'Raddoppia il punteggio base del turno.', icon: WandSparkles, color: 'peach' },
  { id: 'E', name: 'Estensore', tag: '10', text: 'Gioca dieci aggettivi. Contano tutti.', icon: Expand, color: 'violet' },
  { id: 'T', name: 'Top', tag: '1°', text: 'Raddoppia il valore del tuo primo aggettivo.', icon: Star, color: 'yellow' },
  { id: '5', name: '5su10', tag: '5/10', text: 'Proponi dieci parole. Contano le cinque migliori.', icon: ListOrdered, color: 'mint' },
] as const;
const ranking = [
  { name: 'Le parole al vento', initials: 'PV', points: 286, series: 'A', delta: '+2', color: 'mint' },
  { name: 'Giulia', initials: 'GI', points: 274, series: 'A', delta: '+1', color: 'peach' },
  { name: 'I fuori dizionario', initials: 'FD', points: 263, series: 'A', delta: '−2', color: 'violet' },
  { name: 'Andrea', initials: 'AN', points: 251, series: 'A', delta: '+3', color: 'yellow' },
  { name: 'Martina', initials: 'MA', points: 246, series: 'A', delta: '—', color: 'mint' },
  { name: 'Le virgole', initials: 'LV', points: 238, series: 'B', delta: '+1', color: 'violet' },
  { name: 'Paolo', initials: 'PA', points: 227, series: 'B', delta: '+2', color: 'peach' },
  { name: 'I sinonimi', initials: 'SI', points: 219, series: 'B', delta: '−1', color: 'yellow' },
];

function Modal({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); }; }, []);
  return <dialog ref={ref} className={className} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="dialog-title">
    <div className="dialog-content"><button className="icon-button close-dialog" onClick={onClose} aria-label="Chiudi"><X size={21} /></button><h2 id="dialog-title">{title}</h2>{children}</div>
  </dialog>;
}

function readLocal(): Draft { try { return parseDraft(localStorage.getItem(STORAGE_KEY)); } catch { return emptyDraft(); } }
function initialPage(): Page { const p = location.hash.slice(1); return ['turno', 'classifica', 'storico', 'regole', 'admin'].includes(p) ? p as Page : 'turno'; }
function timeLabel(at: string) { return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }).format(new Date(at)); }

export function App() {
  const [page, setPage] = useState<Page>(initialPage);
  const [draft, setDraft] = useState<Draft>(readLocal);
  const [modal, setModal] = useState<ModalName>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [boostersOpen, setBoostersOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const reviewButtonRef = useRef<HTMLButtonElement>(null);
  const turnModalWasOpen = useRef(false);
  const [toast, setToast] = useState('');
  const [saved, setSaved] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [series, setSeries] = useState('Tutte');
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
  const [installPlatform, setInstallPlatform] = useState(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : 'android');
  const [refresh, setRefresh] = useState<(() => Promise<void>) | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const count = requiredWords(draft.booster);
  const completed = draft.words.slice(0, count).filter(w => w.trim()).length;
  const confirmed = sameAsReceipt(draft.words, draft.booster, draft.receipt);
  const selectedBooster = boosters.find(b => b.id === draft.booster);

  useEffect(() => {
    const hash = () => { setPage(initialPage()); setMobileMenu(false); setError(null); };
    const onOnline = () => setOnline(navigator.onLine);
    const onInstall = (e: Event) => { e.preventDefault(); setInstallEvent(e as InstallEvent); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); setModal(null); };
    window.addEventListener('hashchange', hash);
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOnline);
    window.addEventListener('beforeinstallprompt', onInstall); window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('hashchange', hash); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOnline); window.removeEventListener('beforeinstallprompt', onInstall); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  useEffect(() => {
    if (import.meta.env.PROD && import.meta.env.MODE !== 'demo') {
      const update = registerSW({ onNeedRefresh() { setRefresh(() => () => update(true)); } });
    }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); setSaved(true); }
    catch { setSaved(false); }
  }, [draft]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    if (!modal && turnModalWasOpen.current && page === 'turno') reviewButtonRef.current?.focus();
    turnModalWasOpen.current = modal === 'confirm' || modal === 'receipt';
  }, [modal, page]);

  function go(next: Page) { location.hash = next; setPage(next); setMobileMenu(false); setError(null); window.scrollTo({ top: 0, behavior: 'instant' }); }
  async function install() {
    if (installEvent) {
      const prompt = installEvent; setInstallEvent(null);
      try { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome !== 'accepted') setModal('install'); }
      catch { setModal('install'); }
    } else setModal('install');
  }
  function chooseBooster(id: Booster) {
    const next = draft.booster === id ? null : id;
    if (requiredWords(next) === 5 && count === 10 && draft.words.slice(5).some(w => w.trim())) {
      if (!window.confirm('Passando a cinque aggettivi, le parole dalla 6ª alla 10ª posizione resteranno in bozza ma non faranno parte della prova. Continuare?')) return;
    }
    setDraft({ ...draft, booster: next }); setError(null);
  }
  function review() {
    const problem = validateWords(draft.words, draft.booster);
    setError(problem);
    if (problem) errorRef.current?.focus();
    if (!problem) setModal('confirm');
  }
  function reorder(from: number, to: number) {
    setDraft({ ...draft, words: moveWord(draft.words, from, to, count) });
    setError(null);
    setToast(`Aggettivo spostato dalla posizione ${from + 1} alla ${to + 1}.`);
    document.getElementById(`word-${to}`)?.focus();
  }
  function closeTurnModal() { setModal(null); }
  function confirmDemo() {
    const receipt: Receipt = { id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, at: new Date().toISOString(), words: draft.words.slice(0, count).map(w => w.trim()), booster: draft.booster };
    setDraft({ ...draft, receipt }); setModal('receipt');
  }

  return <>
    <a className="skip-link" href="#main">Vai al contenuto</a>
    <div className="demo-bar"><span className="demo-dot" /> Anteprima interattiva <span className="demo-detail">· Dati di esempio, nessuna giocata ufficiale</span></div>
    <aside className={`sidebar ${mobileMenu ? 'is-open' : ''}`}>
      <a className="brand" href="#turno" onClick={() => go('turno')}><img src="/favicon.svg" alt="" /><span>Gioco degli<br /><strong>Aggettivi.</strong></span></a>
      <button className="icon-button mobile-close" aria-label="Chiudi menu" onClick={() => setMobileMenu(false)}><X /></button>
      <div className="edition"><span className="edition-symbol">7</span><div><strong>La settima edizione</strong><span>Una stagione di parole</span></div></div>
      <div className="nav-label">IL GIOCO</div>
      <nav aria-label="Navigazione principale">{nav.map(item => <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? 'page' : undefined} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={e => { e.preventDefault(); go(item.id); }}><item.icon size={19} /><span>{item.label}</span>{page === item.id && <span className="nav-active-dot" />}</a>)}</nav>
      <div className="sidebar-bottom">
        <button className="install-card" onClick={install}><span className="install-icon"><Smartphone size={21} /></span><strong>{installed ? 'Il gioco è con te' : 'Porta il gioco con te'}</strong><span>{installed ? 'Stai usando la versione installata.' : 'Aggiungilo alla schermata Home.'}</span><span className="install-link">{installed ? 'Informazioni' : 'Scopri come'} <ArrowUp size={14} className="diagonal" /></span></button>
        <button className={`admin-link ${page === 'admin' ? 'active' : ''}`} onClick={() => go('admin')}><Settings2 size={17} /> Anteprima amministrazione <ChevronRight size={15} /></button>
        <div className="demo-profile"><span className="avatar peach">TU</span><div><strong>Profilo dimostrativo</strong><span>Esplora il gioco</span></div><span className="tiny-tag">DEMO</span></div>
      </div>
    </aside>
    {mobileMenu && <button className="menu-scrim" aria-label="Chiudi navigazione" onClick={() => setMobileMenu(false)} />}
    <div className="workspace">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Apri menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu(true)}><Menu /></button><span>La stagione</span><ChevronRight size={14} /><strong>{page === 'admin' ? 'Amministrazione' : nav.find(n => n.id === page)?.label}</strong></div><button className="help-button" onClick={() => go('regole')}><CircleHelp size={18} /><span>Come funziona</span></button></header>
      <main id="main" className={page === 'turno' ? 'turn-page' : undefined} tabIndex={-1}>
        {!online && <div className="notice"><WifiOff size={18} /><span>Sei offline. Puoi continuare la bozza su questo dispositivo.</span></div>}
        {!saved && <div className="notice error"><Info size={18} />Il browser non permette di salvare la bozza. Non chiudere la pagina prima di copiarla.</div>}
        {refresh && !updateDismissed && <div className="notice"><Sparkles size={18} /><span>È disponibile una nuova versione. Salva la bozza prima di aggiornare.</span><button onClick={() => void refresh()}>Aggiorna</button><button className="icon-button" aria-label="Più tardi" onClick={() => setUpdateDismissed(true)}><X size={18} /></button></div>}

        {page === 'turno' && <>
          <div className="page-heading turn-heading"><div>
            <div className="eyebrow">SI GIOCA CON LE PAROLE</div>
            <h1>Il tuo prossimo<br className="desktop-only" /> <em>colpo di genio.</em></h1>
            <p>Una parola, una lettera. Trova gli aggettivi che ci uniscono.</p>
          </div><div className="round-counter desktop-only"><span>TURNO DI PROVA</span><strong>01 <small>/ 20</small></strong><div className="round-progress"><i /></div></div></div>
          <div className="game-layout turn-layout">
            <section className="word-card" aria-label="Parola del turno">
              <div className="word-top"><span className="pill"><span className="live-dot desktop-only" />Turno dimostrativo</span><span className="word-number"><span className="desktop-only">N° 01</span><span className="mobile-only">Turno 01 / 20</span></span></div>
              <div className="word-content"><div><span className="word-label">LA PAROLA È</span><h2>DOCUMENTO</h2><p>Quali aggettivi gli stanno meglio?</p></div><div className="letter-tile"><span className="desktop-only">INIZIANO CON</span><span className="mobile-only">LETTERA</span><strong>C</strong><span className="desktop-only">LA TUA LETTERA</span></div></div>
              <div className="word-bottom"><Clock3 size={16} /><span>Scadenza di esempio · <time dateTime="2026-11-22T12:00:00+01:00">22 novembre, ore 12:00</time></span></div>
              <span className="word-decoration desktop-only" aria-hidden="true">Aa</span>
            </section>
            <section className="answers-card" aria-labelledby="answers-title">
              <div className="section-header"><div><h2 id="answers-title">Le tue parole</h2><p id="answer-instructions">Dalla più calzante alla meno calzante, tutte con la C.</p></div><span className="count-tag" aria-label={`${completed} aggettivi compilati su ${count}`}>{completed} <span>/ {count}</span></span></div>
              <form id="turn-form" onSubmit={e => { e.preventDefault(); review(); }}>
                <div className="answer-list">{draft.words.slice(0, count).map((word, index) => <div className={`answer-row ${word.trim() ? 'filled' : ''}`} key={index}>
                  <label htmlFor={`word-${index}`} className="answer-number">{String(index + 1).padStart(2, '0')}</label>
                  <input id={`word-${index}`} aria-label={`Aggettivo in posizione ${index + 1}`} aria-describedby="answer-instructions reorder-instructions" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={64} value={word} placeholder={index === 0 ? 'Il primo che ti viene in mente…' : 'Un altro aggettivo con la C…'} onChange={e => { const words = [...draft.words]; words[index] = e.target.value; setDraft({ ...draft, words }); setError(null); }} />
                  <div className="order-buttons"><button type="button" aria-label={`Sposta aggettivo ${index + 1} in alto`} disabled={index === 0} onClick={() => reorder(index, index - 1)}><ArrowUp size={16} /></button><button type="button" aria-label={`Sposta aggettivo ${index + 1} in basso`} disabled={index === count - 1} onClick={() => reorder(index, index + 1)}><ArrowDown size={16} /></button></div>
                </div>)}</div>
                <p id="reorder-instructions" className="answer-hint"><ListOrdered size={17} /><span>Usa le frecce per cambiare l’ordine.</span></p>
                <div className="save-state" role="status"><CheckCheck size={17} />{saved ? 'Bozza salvata su questo dispositivo' : 'Salvataggio non disponibile'}</div>
              </form>
            </section>
            <section className="boosters-card" aria-labelledby="boosters-title">
              <h2 id="boosters-title"><button type="button" className="booster-toggle" aria-expanded={boostersOpen} aria-controls="booster-options" onClick={() => setBoostersOpen(open => !open)}>
                <span>I tuoi booster<span className="booster-toggle-action">{boostersOpen ? 'Chiudi opzioni' : 'Mostra opzioni'}</span></span><ChevronDown size={22} aria-hidden="true" />
              </button></h2>
              <p className={`booster-summary ${selectedBooster ? 'has-selection' : ''}`} role="status"><Zap size={17} /><span>{selectedBooster ? `${selectedBooster.name} selezionato · ${count} aggettivi` : 'Nessun booster selezionato · 5 aggettivi'}</span></p>
              {!boostersOpen && <ul className="booster-icons" aria-label="I quattro booster">{boosters.map(b => <li key={b.id} className={draft.booster === b.id ? 'selected' : undefined} aria-label={`${b.name}${draft.booster === b.id ? ', selezionato' : ''}`}>
                <span className={`booster-icon ${b.color}`}><b.icon size={22} aria-hidden="true" />{draft.booster === b.id && <span className="booster-icon-check" aria-hidden="true"><Check size={12} /></span>}</span><span className="booster-icon-name">{b.name}</span>
              </li>)}</ul>}
              <div id="booster-options" hidden={!boostersOpen}>
                <p className="section-intro">Scegline uno per questo turno, oppure gioca senza.</p>
                <div className="booster-list">{boosters.map(b => <button type="button" key={b.id} className={`booster-row ${draft.booster === b.id ? 'selected' : ''}`} aria-pressed={draft.booster === b.id} onClick={() => chooseBooster(b.id)}><span className={`booster-icon ${b.color}`}><b.icon size={21} /></span><span className="booster-description"><strong>{b.name}<span>{b.tag}</span></strong><small>{b.text}</small></span><span className="booster-radio" aria-hidden="true">{draft.booster === b.id && <Check size={13} />}</span></button>)}</div>
                {selectedBooster && <button type="button" className="remove-booster" onClick={() => chooseBooster(draft.booster)}>Rimuovi {selectedBooster.name}</button>}
                <div className="booster-note"><Info size={17} /><span>Uno per turno, una volta a stagione. Da utilizzare entro il 15° turno.</span></div>
              </div>
            </section>
            <section className="turn-actions" aria-label="Riepilogo della prova">
              {error && <div ref={errorRef} id="turn-error" className="form-error" role="alert" tabIndex={-1}><Info size={18} /><span>{error}</span><a href="#word-0" onClick={e => { e.preventDefault(); document.getElementById('word-0')?.focus(); }}>Torna ai campi</a></div>}
              {draft.receipt && <button type="button" className={`receipt-strip ${confirmed ? '' : 'changed'}`} onClick={() => setModal('receipt')}><FileCheck2 size={18} /><span>{confirmed ? `Conferma DEMO ${saved ? 'salvata' : 'in memoria'} · Vedi la prova` : 'Bozza modificata dopo la conferma DEMO · Vedi la prova precedente'}</span><ChevronRight size={17} /></button>}
              <div className="review-action"><div><strong>{completed} di {count} aggettivi compilati</strong><p>{selectedBooster ? `Booster: ${selectedBooster.name}` : 'Nessun booster'} · Puoi controllare tutto nel riepilogo.</p></div><button ref={reviewButtonRef} className="primary-button" type="submit" form="turn-form">{confirmed ? 'Rivedi la prova DEMO' : 'Rivedi la giocata'}</button></div>
              <p className="local-note"><ShieldCheck size={17} /><span>È una demo: bozza e conferma restano su questo dispositivo. Non viene inviata alcuna giocata all’organizzatore.</span></p>
            </section>
            <section className="how-card"><span className="how-icon"><Sparkles size={23} /></span><h3>Non cercare la parola più rara.<br /><em>Trova quella che pensano gli altri.</em></h3><p>I punti nascono dalle scelte del gruppo. È tutta una questione di affinità.</p><button className="text-button" onClick={() => go('regole')}>Ripassa le regole</button><span className="how-decoration" aria-hidden="true">“</span></section>
          </div>
          <div className="bottom-caption"><span className="small-flower" aria-hidden="true">✳</span><span>Le parole sono più belle quando diventano un gioco.</span><span>7ª EDIZIONE</span></div>
        </>}

        {page === 'classifica' && <><PageHeading eyebrow="OGNI PAROLA CONTA" title="La classifica." text="Un esempio di come seguirai la stagione, turno dopo turno." /><div className="content-panel"><div className="section-header"><div><h2>Classifica generale</h2><p>Nomi e punteggi sono dimostrativi.</p></div><div className="segmented" aria-label="Filtra per serie">{['Tutte', 'A', 'B'].map(s => <button key={s} aria-pressed={s === series} className={s === series ? 'selected' : ''} onClick={() => setSeries(s)}>{s === 'Tutte' ? s : `Serie ${s}`}</button>)}</div></div><div className="table-scroll"><table className="ranking-table"><thead><tr><th>POS.</th><th>CONCORRENTE</th><th>SERIE</th><th>PUNTI</th><th>VAR.</th></tr></thead><tbody>{ranking.filter(r => series === 'Tutte' || r.series === series).map((r, i) => <tr key={r.name}><td><span className={`position ${i === 0 ? 'first' : ''}`}>{i === 0 ? <Trophy size={17} /> : String(i + 1).padStart(2, '0')}</span></td><td><div className="player"><span className={`avatar ${r.color}`}>{r.initials}</span><strong>{r.name}</strong></div></td><td><span className="series-tag">{r.series}</span></td><td className="points">{r.points}</td><td className="delta">{r.delta}</td></tr>)}</tbody></table></div><div className="panel-footnote"><Info size={16} />Esempio grafico. La formula dei risultati sarà definita dall'autore del regolamento.</div></div></>}

        {page === 'storico' && <><PageHeading eyebrow="IL TUO PERCORSO" title="Le mie giocate." text="Le parole scelte, le prove confermate e i risultati della stagione." />{draft.receipt ? <section className="content-panel history-card"><div className="section-header"><div><span className="pill soft">Prova locale</span><h2>Documento <span className="muted">· C</span></h2><p>{timeLabel(draft.receipt.at)}</p></div><span className="history-round">01</span></div><ol className="history-words">{draft.receipt.words.map((w, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{w}</li>)}</ol><div className="form-footer"><span className="save-state">{draft.receipt.booster ? `Booster: ${boosters.find(b => b.id === draft.receipt!.booster)?.name}` : 'Nessun booster'}</span><button className="text-button" onClick={() => setModal('receipt')}>Vedi conferma <ArrowRight size={17} /></button></div></section> : <section className="empty-state"><span className="empty-icon"><Layers size={31} /></span><h2>Le tue parole iniziano da qui.</h2><p>Compila il turno dimostrativo e conferma la prova.<br />La ritroverai qui, su questo dispositivo.</p><button className="primary-button" onClick={() => go('turno')}>Vai al turno <ArrowRight size={18} /></button></section>}</>}

        {page === 'regole' && <><PageHeading eyebrow="BASTANO CINQUE PAROLE" title="Il bello del gioco." text="Prova a pensare come il gruppo. Poi lasciati sorprendere dalle risposte." /><div className="rules-layout"><section className="content-panel rules-panel"><h2>Come funziona un turno</h2>{[
          ['Una parola e una lettera', 'L’organizzatore propone una parola e l’iniziale degli aggettivi da abbinare.'],
          ['Cinque scelte, nel tuo ordine', 'Scrivi i cinque aggettivi che secondo te saranno più scelti dal gruppo, dal più calzante al meno calzante.'],
          ['Un aiuto quando serve', 'Puoi scegliere un solo booster nel turno. Ogni booster è disponibile una sola volta nella stagione.'],
          ['Conferma entro la scadenza', 'Puoi aggiornare le tue scelte prima della chiusura. Nel gioco online farà fede la conferma del servizio.'],
          ['Scopri le affinità', 'Le risposte dei concorrenti e dei sondaggisti formano la classifica degli aggettivi. Da quella dipendono i punti.'],
        ].map(([title, body], i) => <div className="rule-step" key={title}><span>{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</section><section className="content-panel points-panel"><h2>Il valore delle parole</h2><p>Posizione nella classifica degli aggettivi</p><div className="points-grid">{[50, 30, 20, 15, 12, 10, 8, 7, 6, 5].map((n, i) => <div key={n}><span>{i + 1}°</span><strong>{n}<small>pt</small></strong></div>)}</div><p className="one-point">Le altre parole valide valgono <strong>1 punto</strong>.</p><p>Si aggiungono i bonus previsti per l’ordine corretto e l’en plein.</p><div className="panel-footnote"><Info size={17} />L’autore confermerà formula, casi particolari e testo definitivo prima dell’avvio.</div></section></div></>}

        {page === 'admin' && <AdminPreview />}
      </main>
      <footer className="app-footer"><span>Gioco degli Aggettivi <span>·</span> Fatto per giocare insieme.</span><span>Anteprima 0.1</span></footer>
    </div>
    <nav className="mobile-bottom-nav" aria-label="Navigazione mobile">{nav.map(n => <button key={n.id} aria-current={page === n.id ? 'page' : undefined} className={page === n.id ? 'active' : ''} onClick={() => go(n.id)}><n.icon size={21} /><span>{n.id === 'turno' ? 'Turno' : n.id === 'storico' ? 'Giocate' : n.id === 'regole' ? 'Regole' : 'Classifica'}</span></button>)}</nav>
    {toast && <div className="toast" role="status"><Check size={18} />{toast}</div>}
    {modal === 'install' && <Modal title={installed ? 'Il gioco è sulla tua Home' : 'Il gioco, a portata di tocco.'} onClose={() => setModal(null)}>{installed ? <><p>Stai già usando la modalità app, senza la barra del browser.</p><button className="primary-button full" onClick={() => setModal(null)}>Torna a giocare <ArrowRight size={18} /></button></> : <><p>Aggiungi l’icona alla Home per aprire il gioco come un’app.</p><div className="segmented install-tabs"><button className={installPlatform === 'ios' ? 'selected' : ''} onClick={() => setInstallPlatform('ios')}>iPhone e iPad</button><button className={installPlatform === 'android' ? 'selected' : ''} onClick={() => setInstallPlatform('android')}>Android e computer</button></div><ol className="install-steps">{(installPlatform === 'ios' ? ['Apri questo indirizzo in Safari. Se sei dentro un’altra app, usa “Apri in Safari”.', 'Tocca Condividi nel menu di Safari.', 'Scegli “Aggiungi alla schermata Home”. Mantieni attivo “Apri come app web”, se presente.', 'Tocca Aggiungi, poi apri il gioco dalla nuova icona.'] : ['Apri questo indirizzo in Chrome o in un browser che supporta l’installazione.', 'Apri il menu del browser e scegli “Installa app” o “Aggiungi alla schermata Home”.', 'Conferma e apri il gioco dalla nuova icona.']).map((s, i) => <li key={s}><span>{i + 1}</span><p>{s}</p></li>)}</ol><p className="install-footnote">Puoi continuare a usare il gioco anche dal browser. Nella demo non vengono inviate notifiche.</p><button className="primary-button full" onClick={() => setModal(null)}>Continua dal browser <ArrowRight size={18} /></button></>}</Modal>}
    {modal === 'confirm' && <Modal key="confirm" className="turn-dialog" title="Riepilogo della giocata." onClose={closeTurnModal}>
      <p className="dialog-kicker">TURNO 01 · PROVA DEMO</p>
      <div className="confirmation-word"><span>DOCUMENTO</span><strong>Lettera C</strong></div>
      <ol className="confirmation-list">{draft.words.slice(0, count).map((w, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><strong>{w.trim()}</strong></li>)}</ol>
      <div className="confirmation-booster"><Zap size={18} />{selectedBooster ? `Booster: ${selectedBooster.name}` : 'Nessun booster selezionato'}</div>
      <p className="local-note"><ShieldCheck size={17} /><span>Confermi solo una prova su questo dispositivo. Nessun invio all’organizzatore e nessuna ricevuta ufficiale.</span></p>
      {draft.receipt && !confirmed && <p className="draft-notice">Questa bozza ha modifiche successive alla prova precedente. Confermandola aggiorni la conferma DEMO locale.</p>}
      {!saved && <p className="draft-notice">Il salvataggio non è disponibile: la prova andrà persa chiudendo la pagina.</p>}
      <div className="dialog-actions"><button className="primary-button full" onClick={confirmDemo}>Conferma la prova DEMO <Check size={18} /></button><button className="secondary-button full" onClick={closeTurnModal}>Torna alle parole</button></div>
    </Modal>}
    {modal === 'receipt' && draft.receipt && <Modal key="receipt" className="turn-dialog" title="Conferma DEMO." onClose={closeTurnModal}>
      <p className="dialog-kicker">TURNO 01 · SOLO SU QUESTO DISPOSITIVO</p>
      <p>{saved ? 'La prova confermata è salvata su questo dispositivo.' : 'La prova è in memoria: il browser non permette di salvarla.'} Puoi continuare a modificare la bozza.</p>
      {!confirmed && <p className="draft-notice">Stai guardando la prova precedente. Le modifiche della bozza non sono ancora confermate.</p>}
      <div className="confirmation-word"><span>DOCUMENTO</span><strong>Lettera C</strong></div>
      <ol className="confirmation-list">{draft.receipt.words.map((w, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><strong>{w}</strong></li>)}</ol>
      <div className="confirmation-booster"><Zap size={18} />{draft.receipt.booster ? `Booster: ${boosters.find(b => b.id === draft.receipt!.booster)?.name}` : 'Nessun booster selezionato'}</div>
      <dl className="receipt-details"><div><dt>Riferimento dimostrativo</dt><dd>{draft.receipt.id}</dd></div><div><dt>Orario del dispositivo</dt><dd>{timeLabel(draft.receipt.at)}</dd></div></dl>
      <p className="local-note"><ShieldCheck size={17} /><span>Questa conferma non è una ricevuta ufficiale del torneo. Nel servizio definitivo sarà il server a registrare l’invio.</span></p>
      <div className="dialog-actions"><button className="primary-button full" onClick={closeTurnModal}>Torna alla bozza</button><button className="secondary-button full" onClick={() => { setModal(null); go('storico'); }}>Vedi la mia prova nello storico</button></div>
    </Modal>}
  </>;
}

function PageHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="page-heading simple"><div><div className="eyebrow"><span />{eyebrow}</div><h1>{title}</h1><p>{text}</p></div></div>;
}

function AdminPreview() {
  const [tab, setTab] = useState('Panoramica');
  const [preview, setPreview] = useState(false);
  const [config, setConfig] = useState({ word: 'DOCUMENTO', letter: 'C' });
  const [savedConfig, setSavedConfig] = useState(false);
  return <><PageHeading eyebrow="DIETRO LE QUINTE" title="Tutto il gioco, qui." text="L’area di lavoro dell’organizzatore. Questa schermata è un’anteprima senza dati reali." /><div className="admin-tabs">{['Panoramica', 'Prepara un turno'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>{tab === 'Panoramica' ? <><div className="stats-grid">{[{ icon: Users, value: '64', label: 'Concorrenti di esempio', color: 'violet' }, { icon: FileCheck2, value: '48 / 64', label: 'Giocate di esempio', color: 'mint' }, { icon: Flag, value: '12', label: 'Sondaggisti di esempio', color: 'peach' }].map(s => <div className="stat-card" key={s.label}><span className={`stat-icon ${s.color}`}><s.icon size={23} /></span><strong>{s.value}</strong><span>{s.label}</span></div>)}</div><div className="content-panel"><div className="section-header"><div><h2>Il turno in corso</h2><p>Documento · Lettera C · Turno 01</p></div><span className="pill soft">Esempio</span></div><div className="admin-progress"><div><span>Raccolta delle giocate</span><strong>75%</strong></div><div className="wide-progress"><i /></div></div><div className="admin-workflow">{['Raccolta', 'Revisione', 'Calcolo', 'Pubblicazione'].map((s, i) => <div key={s} className={i === 0 ? 'current' : ''}><span>{i + 1}</span><strong>{s}</strong></div>)}</div><div className="panel-footnote"><ShieldCheck size={17} />La classifica viene pubblicata dopo la revisione dell’organizzatore.</div></div><section className="content-panel admin-decisions"><h2>Prima di calcolare i risultati</h2><p>La formula della classifica degli aggettivi sarà definita dall’autore del regolamento. La demo non calcola né pubblica punteggi ufficiali.</p><button className="secondary-button" onClick={() => setTab('Prepara un turno')}>Prova a preparare un turno <ArrowRight size={17} /></button></section></> : <div className="content-panel admin-form"><h2>Prepara un turno di esempio</h2><p>Puoi provare i campi e vedere l’anteprima. Queste modifiche non cambiano il turno dei giocatori.</p><form onSubmit={e => { e.preventDefault(); setSavedConfig(true); setPreview(true); }}><label htmlFor="admin-word">Parola del turno</label><input id="admin-word" required maxLength={40} value={config.word} onChange={e => { setConfig({ ...config, word: e.target.value.toUpperCase() }); setSavedConfig(false); }} /><label htmlFor="admin-letter">Lettera iniziale</label><input id="admin-letter" required pattern="[A-Za-zÀ-ÿ]" maxLength={1} value={config.letter} onChange={e => { setConfig({ ...config, letter: e.target.value.toUpperCase() }); setSavedConfig(false); }} /><button type="submit" className="primary-button">Mostra anteprima <ArrowRight size={17} /></button></form>{preview && savedConfig && <div className="admin-round-preview"><span>ANTEPRIMA DEL TURNO</span><h3>{config.word}</h3><p>Aggettivi che iniziano con <strong>{config.letter}</strong></p></div>}</div>}</>;
}
