import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortalPage from '../../components/layout/PortalPage.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import Stepper, { StepProgress } from '../../components/ui/Stepper.jsx';
import { ApplicantStep, DocumentsStep, ReviewStep, ScheduleStep, ServiceStep, SubmittedPanel, SubmitStep } from '../../components/forms/RequestWizardSteps.jsx';
import { useRequestWizard } from '../../hooks/useRequestWizard.js';
import { useData } from '../../context/DataContext.jsx';
import { SACRAMENT_NAMES, WIZARD_STEPS } from '../../data/sacraments.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Note from '../../components/ui/Note.jsx';

export default function NewRequestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitMyRequest } = useData();
  const { parishioner } = useAuth();
  const requested = location.state?.service;
  const { state: wizard, dispatch, detailValue } = useRequestWizard(SACRAMENT_NAMES.includes(requested) ? requested : 'Baptism');
  const [reference, setReference] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  useEffect(() => {
    if (!parishioner) return;
    dispatch({ type: 'field', key: 'firstName', value: parishioner.name.split(' ')[0] || '' });
    dispatch({ type: 'field', key: 'lastName', value: parishioner.name.split(' ').slice(1).join(' ') });
    dispatch({ type: 'field', key: 'email', value: parishioner.email });
    dispatch({ type: 'field', key: 'mobile', value: parishioner.contact_number || '' });
  }, [parishioner, dispatch]);

  const { step } = wizard;
  const goTo = (value) => { dispatch({ type: 'step', value }); window.scrollTo({ top: 0 }); };

  const submit = async () => {
    if (!wizard.agree || wizard.submitting) return;
    setSubmissionError('');
    dispatch({ type: 'submitting' });
    const created = await submitMyRequest(wizard.service, {
        date: wizard.date,
        time: wizard.time,
        forWhom: wizard.fields.cn ?? `${wizard.fields.firstName} ${wizard.fields.lastName}`,
        details: wizard.fields,
        documents: wizard.docs,
      });
    if (!created) { setSubmissionError('The request could not be submitted. Please try again.'); dispatch({ type: 'submitFailed' }); return; }
    setReference(created.id);
    dispatch({ type: 'done' });
  };

  const body = {
    1: <ServiceStep wizard={wizard} dispatch={dispatch} />,
    2: <ApplicantStep wizard={wizard} dispatch={dispatch} detailValue={detailValue} />,
    3: <ScheduleStep wizard={wizard} dispatch={dispatch} />,
    4: <DocumentsStep wizard={wizard} dispatch={dispatch} />,
    5: <ReviewStep wizard={wizard} detailValue={detailValue} onEdit={goTo} />,
    6: <SubmitStep wizard={wizard} dispatch={dispatch} />,
  }[step];

  return (
    <PortalPage>
      <div className="mx-auto max-w-[760px]">
        <PageHeader title="New request" />
        {wizard.done ? (
          <SubmittedPanel
            reference={reference}
            onTrack={<Button to="/portal/requests">Track my request</Button>}
            onHome={<Button variant="secondary" to="/portal">Back to home</Button>}
          />
        ) : (
          <>
            <Stepper steps={WIZARD_STEPS} current={step - 1} className="mb-6 max-md:hidden" />
            <div className="md:hidden"><StepProgress step={step} total={WIZARD_STEPS.length} label={WIZARD_STEPS[step - 1]} /></div>
            <Card>
              <CardBody className="!p-[26px] max-sm:!p-[18px]">{body}</CardBody>
              {submissionError && <div className="px-5 pt-4"><Note tone="danger" role="alert">{submissionError}</Note></div>}
              <div className="flex justify-between gap-2.5 rounded-b-xl border-t border-line bg-paper-2 px-5 py-3.5">
                {step > 1 ? <Button variant="secondary" onClick={() => goTo(step - 1)}>Back</Button> : <Button variant="ghost" onClick={() => navigate('/portal')}>Cancel</Button>}
                {step < 6
                  ? <Button onClick={() => goTo(step + 1)}>Continue</Button>
                  : <Button disabled={!wizard.agree} loading={wizard.submitting} onClick={submit}>Submit request</Button>}
              </div>
            </Card>
          </>
        )}
      </div>
    </PortalPage>
  );
}
