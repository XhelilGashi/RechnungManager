const fs = require('fs');

const path = 'src/pages/Rechnungen.tsx';
let content = fs.readFileSync(path, 'utf8');

const startStr = '{isCreating && (';
const endStr = '      {!isCreating && (';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

const replacement = `{isCreating && (
        <LiveInvoiceEditor 
          formData={formData}
          setFormData={setFormData}
          handleSave={handleSave}
          setIsCreating={setIsCreating}
          totals={totals}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          showCustomerDropdown={showCustomerDropdown}
          setShowCustomerDropdown={setShowCustomerDropdown}
          selectCustomer={selectCustomer}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          removeItem={removeItem}
          activeProductDropdown={activeProductDropdown}
          setActiveProductDropdown={setActiveProductDropdown}
          handleProductSelect={handleProductSelect}
        />
      )}\n\n`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
