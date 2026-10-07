import { test, expect } from '@playwright/test';
test('galerie et aperçus sur desktop et mobile', async ({ page }) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto('/');
 const desktop = page.locator('.desktop-layout');
 await expect(desktop.getByRole('heading', { name: 'Applications & Logiciels conçus avec précision' })).toBeVisible();
 await expect(desktop.getByRole('link',{name:'Explorer le projet',exact:true})).toHaveAttribute('href','https://github.com/orgs/trellotech/repositories');
 await desktop.getByText('Découvrir en ligne',{exact:true}).click();
 await page.getByRole('textbox',{name:'Note personnelle'}).fill('Note persistante');
 await page.keyboard.press('Escape'); await page.reload();
 await desktop.getByText('Découvrir en ligne',{exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Note personnelle'})).toHaveValue('Note persistante');
 await page.keyboard.press('Escape');
 for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({width,height:900});
  await page.evaluate(() => window.scrollTo(0,0));
  const layout = page.locator(width < 1024 ? '.mobile-layout' : '.desktop-layout');
  await expect(layout.getByRole('heading',{level:1})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await expect(layout.getByRole('link',{name:'Explorer le projet',exact:true})).toHaveAttribute('href','https://github.com/orgs/trellotech/repositories');
  if (width < 1024) {
   const nav=page.getByRole('navigation',{name:'Navigation mobile'});
   await expect(nav).toBeVisible();
   await nav.getByRole('link',{name:'Labo',exact:true}).click();
   await expect(nav.getByRole('link',{name:'Labo',exact:true})).toHaveAttribute('aria-current','location');
   await layout.getByText('Aperçu interactif',{exact:true}).click();
   await expect(page.getByRole('dialog')).toBeVisible();
   await page.keyboard.press('Escape');
   await nav.getByRole('link',{name:'Vitrine',exact:true}).click();
  }
  await page.screenshot({path:`preview-${width}.png`,fullPage:true});
 }
 expect(errors).toEqual([]);
});

 test('le serveur livre le contenu sans JavaScript', async ({ browser, request, baseURL }) => {
 const response = await request.get('/');
 expect(response.ok()).toBeTruthy();
 const html = await response.text();
 expect(html).toContain('Applications &amp; Logiciels conçus avec précision');
 expect(html).toContain('ngh=');
 const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
 const page = await context.newPage();
 await page.goto('/');
 await expect(page.locator('.desktop-layout h1')).toBeVisible();
 await expect(page.locator('.desktop-layout').getByRole('heading', { name: 'Trellotech', exact: true })).toBeVisible();
 await context.close();
});

test('navbar follows clicks, scrolling and browser history', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await page.goto('/');
 const desktopNav = page.getByRole('navigation', {name:'Navigation principale'});
 await desktopNav.getByRole('link', {name:'Vision & Approche'}).click();
 await expect(desktopNav.getByRole('link', {name:'Vision & Approche'})).toHaveAttribute('aria-current','location');
 await desktopNav.getByRole('link', {name:'Contact',exact:true}).click();
 await expect(desktopNav.getByRole('link', {name:'Contact',exact:true})).toHaveAttribute('aria-current','location');
 await page.goBack();
 await expect(desktopNav.getByRole('link', {name:'Vision & Approche'})).toHaveAttribute('aria-current','location');
 await page.evaluate(()=>window.scrollTo(0,0));
 await expect(desktopNav.getByRole('link', {name:'Applications'})).toHaveAttribute('aria-current','location');
 await page.setViewportSize({width:390,height:844});
 const mobileNav=page.locator('.mobile-tabs');
 await mobileNav.getByRole('link',{name:'Manifeste',exact:true}).focus();
 await page.keyboard.press('Enter');
 await expect(mobileNav.getByRole('link',{name:'Manifeste',exact:true})).toHaveAttribute('aria-current','location');
 await page.evaluate(()=>document.getElementById('contact-mobile')!.scrollIntoView());
 await expect(mobileNav.getByRole('link',{name:'Profil',exact:true})).toHaveAttribute('aria-current','location');
 await page.goto('/#vision');
 await expect(mobileNav.getByRole('link',{name:'Manifeste',exact:true})).toHaveAttribute('aria-current','location');
});

test('new design reveals cards and lights them on hover', async ({ page }) => {
 await page.goto('/');
 const featured=page.locator('.desktop-layout article').first();
 await featured.scrollIntoViewIfNeeded();
 await expect(featured).not.toHaveClass(/reveal-pending/);
 await featured.hover();
 await expect.poll(()=>featured.evaluate(el=>(el as HTMLElement).style.background)).toContain('radial-gradient');
 await page.mouse.move(0,0);
 await expect.poll(()=>featured.evaluate(el=>(el as HTMLElement).style.background)).toBe('');
 await page.locator('.desktop-layout #vision').scrollIntoViewIfNeeded();
 await expect(page.locator('.desktop-layout #vision .reveal-init').first()).not.toHaveClass(/reveal-pending/);
});
