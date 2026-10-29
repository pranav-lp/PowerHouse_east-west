import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:5174';
const output = 'public/screenshots';
const student = { fullName:'Pranav L P', college:'BGS College of Engineering and Technology', usn:'1MP24AD041', email:'pranavlp006@gmail.com', region:'Karnataka', aadhaar:'123456789012', bio:'Building thoughtful products and learning through hackathons.', photoData:'' };
const organizer = { fullName:'Dr. Kavita Rao', organization:'EWIT', designation:'Event Coordinator', type:'College', email:'events@ewit.example', region:'Bengaluru', website:'https://ewit.example', principal:'Dr. Kavita Rao', motto:'Inspire, innovate, impact.', address:'Bengaluru, Karnataka', about:'East-West Institute of Technology connects student builders with meaningful opportunities.' };

const browser = await chromium.launch({ headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport:{ width:1440, height:1000 }, deviceScaleFactor:1 });

async function prepare(route, state = {}) {
  await page.addInitScript(({student, organizer, state}) => {
    localStorage.clear();
    if (state.student) localStorage.setItem('docpass-student-profile', JSON.stringify(student));
    if (state.organizer) localStorage.setItem('docpass-organizer-profile', JSON.stringify(organizer));
  }, {student, organizer, state});
  await page.goto(`${baseUrl}${route}`);
  const skip = page.getByRole('button', {name:'Skip intro'});
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.waitForTimeout(300);
}

await page.goto(baseUrl);
await page.waitForTimeout(500);
await page.screenshot({ path:`${output}/intro.png`, fullPage:true });

await prepare('/onboarding');
await page.screenshot({ path:`${output}/student-onboarding.png`, fullPage:true });

await prepare('/student', {student:true});
await page.screenshot({ path:`${output}/student-home.png`, fullPage:true });
await page.getByRole('button', {name:'My documents'}).click();
await page.screenshot({ path:`${output}/document-vault.png`, fullPage:true });

await prepare('/organizer', {organizer:true});
await page.screenshot({ path:`${output}/organizer-discovery.png`, fullPage:true });
await page.getByRole('button', {name:'Events', exact:true}).click();
await page.screenshot({ path:`${output}/event-analytics.png`, fullPage:true });

await browser.close();
