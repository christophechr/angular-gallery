import { test, expect } from '@playwright/test';
test('galerie et aperçus sur desktop et mobile', async ({ page }) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto('/');
 const desktop = page.locator('.desktop-layout');
 await expect(desktop.getByRole('heading', { name: 'Applications & Logiciels conçus avec précision' })).toBeVisible();
 await expect(desktop.getByRole('link',{name:'Explorer le projet',exact:true})).toHaveAttribute('href','https://github.com/orgs/trellotech/repositories');
 await desktop.getByRole('link', { name: 'Dépôts GitHub' }).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.getByRole('dialog').getByRole('heading')).toHaveText('Code source');
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).not.toBeVisible();
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
   await nav.getByRole('link',{name:'Projets',exact:true}).click();
   await expect(nav.getByRole('link',{name:'Projets',exact:true})).toHaveAttribute('aria-current','location');
   await nav.getByRole('link',{name:'Accueil',exact:true}).click();
  }
  await page.screenshot({path:`test-results/preview-${width}.png`,fullPage:true});
 }
 expect(errors).toEqual([]);
});

 test('le HTML prérendu contient le contenu sans JavaScript', async ({ browser, request, baseURL }) => {
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
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.mobile-layout h1')).toBeVisible();
 await expect(page.locator('.mobile-projects').getByRole('heading', { name: 'Trellotech', exact: true })).toBeVisible();
 await expect(page.getByRole('navigation', { name: 'Navigation mobile' })).toBeVisible();
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
 await mobileNav.getByRole('link',{name:'Vision',exact:true}).focus();
 await page.keyboard.press('Enter');
 await expect(mobileNav.getByRole('link',{name:'Vision',exact:true})).toHaveAttribute('aria-current','location');
 await page.evaluate(()=>document.getElementById('contact-mobile')!.scrollIntoView());
 await expect(mobileNav.getByRole('link',{name:'Contact',exact:true})).toHaveAttribute('aria-current','location');
 await page.goto('/#vision');
 await expect(mobileNav.getByRole('link',{name:'Vision',exact:true})).toHaveAttribute('aria-current','location');
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
