import { Component, ElementRef, ViewChild, signal, afterNextRender, DestroyRef, inject } from '@angular/core';
@Component({selector:'app-root',standalone:true,templateUrl:'./app.html'})
export class App {
 @ViewChild('projectDialog') dialog!:ElementRef<HTMLDialogElement>;
 contactStatus=signal('');
 activeSection=signal('galerie');
 activeTab=signal('vitrine'); menuOpen=signal(false); selected=signal(''); draft=signal('');
 tasks=signal(['Dessiner la prochaine interface','Explorer une nouvelle idée','Partager le prototype']);
 note=signal(''); speed=signal(10);
 constructor() {
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
   this.note.set(localStorage.getItem('gallery-note') ?? '');
   const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
   const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
     if (entry.isIntersecting) {
      entry.target.classList.remove('reveal-pending');
      entry.target.classList.add('reveal-visible');
      revealObserver.unobserve(entry.target);
     }
    });
   }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
   document.querySelectorAll<HTMLElement>('.reveal-init').forEach(element => {
    if (!reducedMotion.matches && element.getBoundingClientRect().top >= window.innerHeight) {
     element.classList.add('reveal-pending');
     revealObserver.observe(element);
    }
   });
   const glow = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
    const card = (event.target as Element).closest<HTMLElement>('.interactive-glow');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.background = `radial-gradient(circle 260px at ${event.clientX - rect.left}px ${event.clientY - rect.top}px, rgba(255,237,226,.35), #fff 100%)`;
   };
   const clearGlow = (event: PointerEvent) => {
    const card = (event.target as Element).closest<HTMLElement>('.interactive-glow');
    if (card && !(event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) card.style.background = '';
   };
   const revealFocus = (event: FocusEvent) => {
    (event.target as Element).closest('.reveal-pending')?.classList.remove('reveal-pending');
   };
   document.addEventListener('pointermove', glow, { passive: true });
   document.addEventListener('pointerout', clearGlow);
   document.addEventListener('focusin', revealFocus);
   let frame = 0;
   const sync = () => {
    frame = 0;
    const mobile = window.innerWidth < 1024;
    const ids = mobile ? ['accueil-mobile', 'selection-projets', 'philosophie', 'contact-mobile'] : ['accueil', 'galerie', 'vision', 'contact'];
    const sectionOffset = mobile ? (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 110) + 2 : 150;
    let current = 0;
    ids.forEach((id, index) => {
     const element = document.getElementById(id);
     if (element && element.getBoundingClientRect().top <= sectionOffset) current = index;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 3;
    this.activeTab.set(['vitrine', 'labo', 'manifeste', 'profil'][current]);
    this.activeSection.set(['galerie', 'galerie', 'vision', 'contact'][current]);
   };
   const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
   const followHash = () => {
    const id = window.location.hash.slice(1);
    const desktopIds = ['accueil', 'galerie', 'vision', 'contact'];
    const mobileIds = ['accueil-mobile', 'selection-projets', 'philosophie', 'contact-mobile'];
    const source = window.innerWidth < 1024 ? desktopIds : mobileIds;
    const target = window.innerWidth < 1024 ? mobileIds : desktopIds;
    const index = source.indexOf(id);
    document.getElementById(index >= 0 ? target[index] : id)?.scrollIntoView();
    this.menuOpen.set(false);
    schedule();
   };
   window.addEventListener('scroll', schedule, { passive: true });
   window.addEventListener('resize', schedule);
   window.addEventListener('hashchange', followHash);
   followHash();
   destroyRef.onDestroy(() => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('hashchange', followHash);
    cancelAnimationFrame(frame);
    revealObserver.disconnect();
    document.removeEventListener('pointermove', glow);
    document.removeEventListener('pointerout', clearGlow);
    document.removeEventListener('focusin', revealFocus);
   });
  });
 }
 prepareContactEmail(event:Event){
  event.preventDefault();
  const form=event.currentTarget as HTMLFormElement;
  if(!form.reportValidity()) return;
  const data=new FormData(form);
  const name=String(data.get('name') ?? '').trim();
  const email=String(data.get('email') ?? '').trim();
  const subject=String(data.get('subject') ?? '').trim();
  const message=String(data.get('message') ?? '').trim();
  if(!name || !subject || message.length<10){
   this.contactStatus.set('Merci de renseigner votre nom, un objet et un message d’au moins 10 caractères.');
   return;
  }
  const body=`${message}\n\nDe : ${name}\nE-mail : ${email}`;
  window.location.href=`mailto:christophe.chhor.dev@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  this.contactStatus.set('Votre e-mail est prêt. Si votre messagerie ne s’ouvre pas, utilisez l’adresse de contact ci-dessous.');
 }
 openProject(event:Event,name:string){event.preventDefault();this.selected.set(name);this.dialog.nativeElement.showModal();}
 closeOnBackdrop(event:MouseEvent){if(event.target===this.dialog.nativeElement)this.dialog.nativeElement.close();}
 addTask(event:Event){event.preventDefault();const task=this.draft().trim();if(task){this.tasks.update(tasks=>[...tasks,task]);this.draft.set('');}}
 saveNote(value:string){this.note.set(value);localStorage.setItem('gallery-note',value);}
}
