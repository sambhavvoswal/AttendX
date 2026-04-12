import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  StepConnectSheet, StepNameSheet, StepSetPK, 
  StepMapQR, StepAttendanceValues, StepConfirm 
} from './WizardSteps';
import { useSheet } from '../../../hooks/useSheet';
import { DEFAULT_ATTENDANCE_VALUES } from '../../../constants';

const STEPS = [
  'Connect Google Sheet',
  'Name your Sheet',
  'Set Primary Key',
  'Map QR Data',
  'Attendance Values',
  'Review & Confirm'
];

export function SheetSetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const { createSheet } = useSheet();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sheet_url: '',
    display_name: '',
    access_method: 'service_account',
    primary_key_column: '',
    qr_key_mapping: {},
    attendance_values: DEFAULT_ATTENDANCE_VALUES,
    _columns: []  // transient — fetched from verify-access, not sent to backend
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const updateData = (fields) => setFormData(prev => ({ ...prev, ...fields }));

  const handleSubmit = async () => {
    try {
      // Strip transient fields before sending
      const { _columns, ...submitData } = formData;
      await createSheet(submitData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || err.message || 'Failed to create sheet');
    }
  };

  const StepComponents = [
    StepConnectSheet,
    StepNameSheet,
    StepSetPK,
    StepMapQR,
    StepAttendanceValues,
    StepConfirm
  ];

  const CurrentStepComponent = StepComponents[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-bg p-6 border-b border-border">
        <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">
          Step {currentStep + 1} of {STEPS.length}
        </div>
        <h2 className="font-['Fraunces'] text-2xl tracking-tight text-text-primary">
          {STEPS[currentStep]}
        </h2>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-surface mt-4 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-accent"
            initial={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 min-h-[350px] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <CurrentStepComponent
               data={formData}
               updateData={updateData}
               nextStep={nextStep}
               prevStep={prevStep}
               onSubmit={handleSubmit}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
