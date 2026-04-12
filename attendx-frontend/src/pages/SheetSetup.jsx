import { SheetSetupWizard } from '../components/sheets/wizard/SheetSetupWizard';
import { PageShell } from '../components/layout/PageShell';

export function SheetSetup() {
  return (
    <div className="py-8">
      <div className="mb-8">
         <h1 className="font-['Fraunces'] text-3xl tracking-tight text-text-primary">New Sheet</h1>
         <p className="text-text-secondary mt-2">Connect a new Google Sheet to track its attendance.</p>
      </div>
      
      <SheetSetupWizard />
    </div>
  );
}
