const fs = require('fs');

function applyGlassDashboard() {
    const filePath = 'src/pages/Dashboard.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace Dashboard cards to use glass style
    // bg-white rounded-2xl shadow-sm border border-slate-100/50 -> bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-black/5
    content = content.replace(/bg-white rounded-2xl shadow-[sm|md]* border border-slate-[-0-9a-z\/]+/g, 'bg-card backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border');
    content = content.replace(/bg-white rounded-2xl p-6 border border-slate-100 shadow-sm/g, 'bg-card backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border');
    // Also clean up static bg-white references
    content = content.replace(/bg-white/g, 'bg-card');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated Dashboard for Glass styling");
}

function applyGlassKunden() {
    const filePath = 'src/pages/Kunden.tsx';
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/bg-white rounded-xl shadow-sm border border-border/g, 'bg-card backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border');
    content = content.replace(/bg-white rounded-lg shadow-sm border border-border/g, 'bg-card backdrop-blur-md rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border');
    content = content.replace(/bg-white/g, 'bg-card');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated Kunden for Glass styling");
}

function applyGlassRechnungen() {
    const filePath = 'src/pages/Rechnungen.tsx';
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/bg-white rounded-xl shadow-sm border border-border/g, 'bg-card backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border');
    content = content.replace(/bg-white rounded-2xl shadow-sm border border-border/g, 'bg-card backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border');
    
    // We intentionally ignore LiveInvoiceEditor for the actual invoice form, we want that clean white, but maybe the modal wrapping it should be glass. LiveInvoiceEditor uses 'bg-slate-100' for wrapper. Let's fix that wrapper to backdrop blur too!
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated Rechnungen for Glass styling");
}

function applyGlassEinstellungen() {
    const filePath = 'src/pages/Einstellungen.tsx';
    let content = fs.readFileSync(filePath, 'utf8');
    // For Settings cards
    content = content.replace(/bg-card shadow-sm border border-border/g, 'bg-card backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border');
    content = content.replace(/bg-white/g, 'bg-card');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated Einstellungen for Glass styling");
}


function applyGlassGlobalModals() {
    // Specifically fix LiveInvoiceEditor main background
    const filePath = 'src/components/LiveInvoiceEditor.tsx';
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/bg-slate-100 overflow-y-auto/g, 'bg-black/20 backdrop-blur-sm overflow-y-auto');
    content = content.replace(/bg-white border-b border-slate-200/g, 'bg-card/90 backdrop-blur-md border-b border-border');
    // But leave the actual PDF layout as `bg-white` 
    // We can do this because we replaced bg-white earlier? Wait, in LiveInvoiceEditor, there is `bg-white w-full max-w-[210mm]`. We SHOULD keep that as raw white since it's the paper.
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated LiveInvoiceEditor modal background");
}

applyGlassDashboard();
applyGlassKunden();
applyGlassRechnungen();
applyGlassEinstellungen();
applyGlassGlobalModals();
