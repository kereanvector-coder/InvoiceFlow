const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx'));

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to hide the block containing bank details.
  // I will just manually define the replacements for each template.
  
  if (file === 'CateringTemplate.tsx') {
    content = content.replace(
      '<div className="mx-3 mt-1.5 bg-white rounded-[8px] border border-[#FECACA] p-2">',
      '{!isReceipt && <div className="mx-3 mt-1.5 bg-white rounded-[8px] border border-[#FECACA] p-2">'
    );
    content = content.replace(
      '</div>\n      </div>\n\n      {/* Notes */}',
      '</div>\n      </div>}\n\n      {/* Notes */}'
    );
  }
  
  if (file === 'ClassicTemplate.tsx') {
    content = content.replace(
      '          {/* Payment Info */}\n          <div>\n            <h3 className="text-[9px]',
      '          {/* Payment Info */}\n          <div>\n            {!isReceipt && <>\n            <h3 className="text-[9px]'
    );
    // Be careful here to find the end of Payment Info. It is before terms.
    content = content.replace(
      '            </div>\n            \n            {details.isQuote && details.terms && (',
      '            </div>\n            </>}\n            \n            {details.isQuote && details.terms && ('
    );
  }
  
  if (file === 'CorporateTemplate.tsx') {
    content = content.replace(
      '          <div>\n            <div className={`text-[9px] ${isReceipt ? \'text-emerald-600\' : \'text-[#1E3A5F]\'} uppercase tracking-[0.1em] font-bold`}>REMITTANCE TO</div>',
      '          <div>\n            {!isReceipt && <>\n            <div className={`text-[9px] ${isReceipt ? \'text-emerald-600\' : \'text-[#1E3A5F]\'} uppercase tracking-[0.1em] font-bold`}>REMITTANCE TO</div>'
    );
    content = content.replace(
      '            <div className="text-[11px] text-[#475569]">Account Name: {business.account_name}</div>\n          </div>',
      '            <div className="text-[11px] text-[#475569]">Account Name: {business.account_name}</div>\n            </>}\n          </div>'
    );
  }
  
  if (file === 'CreativeTemplate.tsx') {
    content = content.replace(
      '<div className="bg-white border-2 border-[#EDE9FE] rounded-md p-1.5">',
      '{!isReceipt && <div className="bg-white border-2 border-[#EDE9FE] rounded-md p-1.5">'
    );
    content = content.replace(
      '</span>\n            </div>\n          </div>\n        </div>\n\n        {invoice.notes && (',
      '</span>\n            </div>\n          </div>\n        </div>}\n\n        {invoice.notes && ('
    );
  }

  if (file === 'EcommerceTemplate.tsx') {
    content = content.replace(
      '      {/* Payment details / Terms */}\n      <div className="bg-white rounded-md p-2 shadow-sm border border-[#E2E8F0] mb-2">\n        <div className={`${isReceipt ? \'text-emerald-600\' : \'text-[#2563EB]\'} font-bold text-[9px] mb-1.5`}>💳 PAYMENT INSTRUCTIONS</div>',
      '      {/* Payment details / Terms */}\n      {!isReceipt && <div className="bg-white rounded-md p-2 shadow-sm border border-[#E2E8F0] mb-2">\n        <div className={`${isReceipt ? \'text-emerald-600\' : \'text-[#2563EB]\'} font-bold text-[9px] mb-1.5`}>💳 PAYMENT INSTRUCTIONS</div>'
    );
    content = content.replace(
      '        </div>\n      </div>\n\n      {/* Notes */}',
      '        </div>\n      </div>}\n\n      {/* Notes */}'
    );
  }

  if (file === 'EducationTemplate.tsx') {
    content = content.replace(
      '      {/* Transfer Information */}\n      <div className="mx-2 mt-1 bg-white rounded-md border border-[#BFDBFE] p-1.5">',
      '      {/* Transfer Information */}\n      {!isReceipt && <div className="mx-2 mt-1 bg-white rounded-md border border-[#BFDBFE] p-1.5">'
    );
    content = content.replace(
      '            <span className="font-bold text-[#1E3A8A]">{business.account_name}</span>\n          </div>\n        </div>\n      </div>\n\n      {/* Notes */}',
      '            <span className="font-bold text-[#1E3A8A]">{business.account_name}</span>\n          </div>\n        </div>\n      </div>}\n\n      {/* Notes */}'
    );
  }

  if (file === 'ExecutiveTemplate.tsx') {
    content = content.replace(
      '        {/* Payment info */}\n        <div className="w-1/2 bg-[#242424] border border-[#333] p-2">',
      '        {/* Payment info */}\n        <div className="w-1/2 bg-[#242424] border border-[#333] p-2">\n          {!isReceipt && <>'
    );
    content = content.replace(
      '              <span className={`${isReceipt ? \'text-emerald-600\' : \'text-[#F5F0E8]\'} font-medium`}>{business.account_name}</span>\n            </div>\n          </div>\n        </div>',
      '              <span className={`${isReceipt ? \'text-emerald-600\' : \'text-[#F5F0E8]\'} font-medium`}>{business.account_name}</span>\n            </div>\n          </div>\n          </>}\n        </div>'
    );
  }

  if (file === 'ModernTemplate.tsx') {
    content = content.replace(
      '          <div className="bg-[#1A1A1A] p-1.5 rounded-md border border-[#26262699]">\n            <h3 className="text-[#737373] text-[8px] font-bold uppercase tracking-wider mb-0.5">Payment Details</h3>',
      '          <div className="bg-[#1A1A1A] p-1.5 rounded-md border border-[#26262699]">\n            {!isReceipt && <>\n            <h3 className="text-[#737373] text-[8px] font-bold uppercase tracking-wider mb-0.5">Payment Details</h3>'
    );
    content = content.replace(
      '            <p className="text-[#A3A3A3] text-[9px]">{business.account_name}</p>\n          </div>',
      '            <p className="text-[#A3A3A3] text-[9px]">{business.account_name}</p>\n            </>}\n          </div>'
    );
  }

  if (file === 'NoirTemplate.tsx') {
    content = content.replace(
      '            <div className="text-[8px] text-[#C4977A] uppercase tracking-widest mb-1.5">Remittance Details</div>',
      '            {!isReceipt && <>\n            <div className="text-[8px] text-[#C4977A] uppercase tracking-widest mb-1.5">Remittance Details</div>'
    );
    content = content.replace(
      '                <span className={`${isReceipt ? \'text-emerald-600\' : \'text-[#F5F0E8]\'}`}>{business.account_name}</span>\n              </div>\n            </div>\n          </div>',
      '                <span className={`${isReceipt ? \'text-emerald-600\' : \'text-[#F5F0E8]\'}`}>{business.account_name}</span>\n              </div>\n            </div>\n            </>}\n          </div>'
    );
  }

  if (file === 'TechTemplate.tsx') {
    content = content.replace(
      '        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-1.5">\n          <div className="text-[8px] text-[#238636] mb-0.5">bank_name:</div>',
      '        {/* <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-1.5"> */}\n        {!isReceipt && <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-1.5">\n          <div className="text-[8px] text-[#238636] mb-0.5">bank_name:</div>'
    );
    content = content.replace(
      '          <div className="text-[8px] text-[#238636] mb-0.5">account_name:</div>\n          <div className="text-[9px] text-[#8B949E]">\047{business.account_name}\047</div>\n        </div>',
      '          <div className="text-[8px] text-[#238636] mb-0.5">account_name:</div>\n          <div className="text-[9px] text-[#8B949E]">\047{business.account_name}\047</div>\n        </div>}'
    );
    
    // TechTemplate also has a second block for transfer instructions
    content = content.replace(
      '      {/* Transfer instructions */}\n      <div className="mx-2 mt-1 bg-[#161B22] border border-[#238636] rounded-lg p-1.5">',
      '      {/* Transfer instructions */}\n      {!isReceipt && <div className="mx-2 mt-1 bg-[#161B22] border border-[#238636] rounded-lg p-1.5">'
    );
    content = content.replace(
      '          <span className="text-[#E6EDF3]">{\'}\'}</span>\n        </div>\n      </div>\n\n      {/* Notes */}',
      '          <span className="text-[#E6EDF3]">{\'}\'}</span>\n        </div>\n      </div>}\n\n      {/* Notes */}'
    );
  }

  if (file === 'TradesTemplate.tsx') {
    content = content.replace(
      '      {/* Payment Instructions */}\n      <div className="bg-[#292524] rounded-lg p-3 mx-4 mb-3">',
      '      {/* Payment Instructions */}\n      {!isReceipt && <div className="bg-[#292524] rounded-lg p-3 mx-4 mb-3">'
    );
    content = content.replace(
      '            <span className="font-bold text-[#FEF3C7]">{business.account_name}</span>\n          </div>\n        </div>\n      </div>\n\n      {/* Notes */}',
      '            <span className="font-bold text-[#FEF3C7]">{business.account_name}</span>\n          </div>\n        </div>\n      </div>}\n\n      {/* Notes */}'
    );
  }

  if (file === 'WellnessTemplate.tsx') {
    content = content.replace(
      '      {/* Payment Details */}\n      <div className="mx-4 mt-2 bg-white rounded-[12px] p-3">',
      '      {/* Payment Details */}\n      {!isReceipt && <div className="mx-4 mt-2 bg-white rounded-[12px] p-3">'
    );
    content = content.replace(
      '            <span className="font-bold text-[#134E4A]">{business.account_name}</span>\n          </div>\n        </div>\n      </div>\n\n      {/* Terms/Notes */}',
      '            <span className="font-bold text-[#134E4A]">{business.account_name}</span>\n          </div>\n        </div>\n      </div>}\n\n      {/* Terms/Notes */}'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Bank details hidden successfully');
