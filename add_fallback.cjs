const fs = require('fs');

function addFallbackInfo() {
    const filePath = 'src/components/LiveInvoiceEditor.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    const searchStr = '{/* Right: Company Logo & Info */}\n            <div className="w-[45%] flex flex-col items-end text-sm leading-relaxed text-slate-800 pl-8">\n              {logo && <img src={logo} className="h-20 object-contain mb-6" alt="Company Logo" />}\n              <div className="font-bold text-base text-slate-900 mb-1">{settings?.companyName || \'Dein Firmenname\'}</div>\n              <div>{settings?.companyStreet}</div>\n              <div className="mb-3">{settings?.companyZip} {settings?.companyCity}</div>\n              \n              <div className="text-slate-500 space-y-1 text-right">\n                {settings?.companyEmail && <div>{settings?.companyEmail}</div>}\n                {settings?.companyPhone && <div>Tel: {settings?.companyPhone}</div>}\n                {settings?.companyWebsite && <div>{settings?.companyWebsite}</div>}\n              </div>\n            </div>';

    const replacement = `{/* Right: Company Logo & Info */}
            <div className="w-[45%] flex flex-col items-end text-sm leading-relaxed text-slate-800 pl-8">
              {logo && <img src={logo} className="h-20 object-contain mb-6" alt="Company Logo" />}
              {!(settings?.companyName || settings?.companyStreet || settings?.companyEmail || settings?.companyPhone) ? (
                 <div className="text-amber-600 bg-amber-50 p-4 border border-amber-100 rounded-md text-right w-full">
                    Bitte Firmendaten in Einstellungen ausfüllen
                 </div>
              ) : (
                <>
                  {settings?.companyName && <div className="font-bold text-base text-slate-900 mb-1">{settings.companyName}</div>}
                  {settings?.companyStreet && <div>{settings.companyStreet}</div>}
                  {(settings?.companyZip || settings?.companyCity) && <div className="mb-3">{settings?.companyZip} {settings?.companyCity}</div>}
                  
                  <div className="text-slate-500 space-y-1 text-right">
                    {settings?.companyEmail && <div>{settings.companyEmail}</div>}
                    {settings?.companyPhone && <div>Tel: {settings.companyPhone}</div>}
                    {settings?.companyWebsite && <div>{settings.companyWebsite}</div>}
                  </div>
                </>
              )}
            </div>`;

    if (content.includes('{/* Right: Company Logo & Info */}')) {
         const startIdx = content.indexOf('{/* Right: Company Logo & Info */}');
         const endOfBlock = content.indexOf('</div>\n          </div>\n\n          {/* Subject & Message */}');
         if(endOfBlock !== -1) {
            content = content.substring(0, startIdx) + replacement + "\n" + content.substring(endOfBlock);
         }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced live invoice fallback");
}

addFallbackInfo();
