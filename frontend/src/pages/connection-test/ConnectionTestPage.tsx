import { Fragment } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  ServerCog,
} from 'lucide-react';

import AuthBackground from '@/components/auth/AuthBackground';
import { Button } from '@/components/ui/button';
import { ApiError, get } from '@/lib/base';

type ReadinessResponse = Record<string, unknown>;

const SUCCESS_MESSAGE = 'Frontend is connected to backend successfully.';

const POSITIVE_STATUS = new Set([
  'ok',
  'ready',
  'healthy',
  'up',
  'connected',
  'success',
  'passed',
  'true',
]);

const NEGATIVE_STATUS = new Set([
  'error',
  'failed',
  'down',
  'unhealthy',
  'not ready',
  'not_ready',
  'disconnected',
  'false',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPrimitive(
  value: unknown,
): value is string | number | boolean | null | undefined {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function formatLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function getValueTone(value: unknown) {
  if (typeof value === 'boolean') return value ? 'success' : 'error';
  if (typeof value !== 'string') return 'neutral';

  const normalized = value.trim().toLowerCase();
  if (POSITIVE_STATUS.has(normalized)) return 'success';
  if (NEGATIVE_STATUS.has(normalized)) return 'error';
  return 'neutral';
}

function StatusBadge({ value }: { value: unknown }) {
  const tone = getValueTone(value);
  const className =
    tone === 'success'
      ? 'border-[#C7F0D7] bg-[#ECFDF3] text-[#027A48]'
      : tone === 'error'
        ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B42318]'
        : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#344054]';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-extrabold ${className}`}
    >
      {formatValue(
        isPrimitive(value) ? value : JSON.stringify(value, null, 2) || '—',
      )}
    </span>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  return (
    <div className='rounded-[16px] border border-[#E8EDF2] bg-[#FCFDFE] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]'>
      <div className='text-[12px] font-semibold uppercase tracking-[0.08em] text-[#667085]'>
        {label}
      </div>
      <div className='mt-2'>
        <StatusBadge value={value} />
      </div>
    </div>
  );
}

function CheckValue({ value }: { value: unknown }) {
  if (isPrimitive(value)) {
    return <StatusBadge value={value} />;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <StatusBadge value='Empty' />;
    }

    return (
      <div className='space-y-2'>
        {value.map((item, index) => (
          <div
            key={index}
            className='rounded-[12px] border border-[#EEF2F6] bg-white p-3'
          >
            <CheckValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <StatusBadge value='No details' />;
    }

    return (
      <div className='space-y-3'>
        {entries.map(([key, nestedValue]) => (
          <div
            key={key}
            className='rounded-[14px] border border-[#EEF2F6] bg-white p-4'
          >
            <div className='mb-3 text-[13px] font-black text-[#111827]'>
              {formatLabel(key)}
            </div>
            <CheckValue value={nestedValue} />
          </div>
        ))}
      </div>
    );
  }

  return <StatusBadge value={String(value)} />;
}

function ChecksSection({ checks }: { checks: unknown }) {
  if (!isRecord(checks)) {
    return (
      <div className='rounded-[16px] border border-dashed border-[#D0D5DD] bg-[#FCFDFE] p-4 text-sm text-[#667085]'>
        No structured readiness checks were returned.
      </div>
    );
  }

  const entries = Object.entries(checks);

  if (entries.length === 0) {
    return (
      <div className='rounded-[16px] border border-dashed border-[#D0D5DD] bg-[#FCFDFE] p-4 text-sm text-[#667085]'>
        No readiness checks were included in the response.
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {entries.map(([key, value]) => (
        <div
          key={key}
          className='rounded-[18px] border border-[#E8EDF2] bg-[#FCFDFE] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'
        >
          <div className='mb-3 text-[14px] font-black text-[#111827]'>
            {formatLabel(key)}
          </div>
          <CheckValue value={value} />
        </div>
      ))}
    </div>
  );
}

function getProcessStatus(data: ReadinessResponse) {
  if (typeof data.processStatus === 'string') return data.processStatus;
  if (isRecord(data.process) && typeof data.process.status === 'string') {
    return data.process.status;
  }
  return undefined;
}

function getErrorDetails(error: unknown) {
  if (error instanceof ApiError) {
    const backendMessage =
      typeof error.body.message === 'string'
        ? error.body.message
        : typeof error.body.error === 'string'
          ? error.body.error
          : error.message;

    return {
      title: 'Backend readiness check failed.',
      description:
        backendMessage || 'The backend returned an unsuccessful readiness response.',
      statusCode: error.status,
      messageKey:
        typeof error.body.messageKey === 'string' ? error.body.messageKey : null,
    };
  }

  if (error instanceof Error) {
    const description =
      error.message.includes('Failed to fetch') || error.message === 'Network error'
        ? 'The browser could not reach the backend through /api/health/ready.'
        : error.message;

    return {
      title: 'Backend readiness check failed.',
      description,
      statusCode: null,
      messageKey: null,
    };
  }

  return {
    title: 'Backend readiness check failed.',
    description: 'An unexpected error happened while checking backend readiness.',
    statusCode: null,
    messageKey: null,
  };
}

export default function ConnectionTestPage() {
  const readinessQuery = useQuery({
    queryKey: ['connection-test', 'readiness'],
    queryFn: () => get<ReadinessResponse>('/api/health/ready', { locale: 'en' }),
    retry: false,
    staleTime: 0,
  });

  const response = readinessQuery.data ?? {};
  const errorDetails = readinessQuery.error
    ? getErrorDetails(readinessQuery.error)
    : null;
  const overviewItems = [
    { label: 'Status', value: response.status },
    { label: 'Mode', value: response.mode },
    { label: 'Message', value: response.message },
    { label: 'Message Key', value: response.messageKey },
    { label: 'Process Status', value: getProcessStatus(response) },
  ].filter((item) => item.value !== undefined);

  return (
    <AuthBackground className='py-8 sm:py-12'>
      <Helmet>
        <title>System Connection Test • LMJ Health</title>
      </Helmet>

      <section className='flex min-h-screen w-full items-center justify-center px-4 sm:px-6'>
        <div className='w-full max-w-5xl rounded-[28px] border border-[#FFFFFFCC] bg-[#FFFFFFE6] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.18)] backdrop-blur sm:p-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <div className='inline-flex items-center gap-2 rounded-full border border-[#D8F3F1] bg-[#F2FFFE] px-3 py-1 text-[12px] font-extrabold text-primary'>
                <ServerCog className='h-4 w-4' />
                Real frontend request
              </div>
              <h1 className='mt-4 text-3xl font-black tracking-tight text-[#111827]'>
                System Connection Test
              </h1>
              <p className='mt-2 text-sm font-semibold text-[#667085]'>
                Checks frontend-to-backend readiness
              </p>
              <p className='mt-2 text-xs font-semibold text-[#98A2B3]'>
                Endpoint: <span className='font-black text-[#344054]'>/api/health/ready</span>
              </p>
            </div>

            <Button
              type='button'
              variant='outline'
              onClick={() => readinessQuery.refetch()}
              disabled={readinessQuery.isFetching}
              className='h-10 gap-2 self-start border-[#D0D5DD] bg-white text-[#344054]'
            >
              <RefreshCw
                className={`h-4 w-4 ${readinessQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Retry
            </Button>
          </div>

          <div className='mt-6 rounded-[24px] border border-[#E8EDF2] bg-[#FCFDFE] p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)]'>
            {readinessQuery.isLoading ? (
              <div className='flex flex-col items-center justify-center gap-4 py-10 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <LoaderCircle className='h-8 w-8 animate-spin' />
                </div>
                <div>
                  <div className='text-lg font-black text-[#111827]'>
                    Checking backend readiness...
                  </div>
                  <p className='mt-2 text-sm font-semibold text-[#667085]'>
                    Sending a real browser request through the frontend.
                  </p>
                </div>
              </div>
            ) : null}

            {readinessQuery.isError && errorDetails ? (
              <div className='flex flex-col items-center justify-center gap-4 py-6 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3F2] text-[#B42318]'>
                  <AlertTriangle className='h-8 w-8' />
                </div>
                <div>
                  <div className='text-lg font-black text-[#111827]'>
                    {errorDetails.title}
                  </div>
                  <p className='mt-2 text-sm font-semibold text-[#667085]'>
                    {errorDetails.description}
                  </p>
                </div>

                <div className='grid w-full max-w-2xl gap-3 sm:grid-cols-2'>
                  <DetailCard
                    label='Status Code'
                    value={errorDetails.statusCode ?? 'Unavailable'}
                  />
                  <DetailCard
                    label='Message Key'
                    value={errorDetails.messageKey ?? 'Unavailable'}
                  />
                </div>
              </div>
            ) : null}

            {readinessQuery.isSuccess ? (
              <Fragment>
                <div className='flex flex-col items-center justify-center gap-4 py-2 text-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF3] text-[#039855]'>
                    <CheckCircle2 className='h-8 w-8' />
                  </div>
                  <div>
                    <div className='text-lg font-black text-[#111827]'>
                      {SUCCESS_MESSAGE}
                    </div>
                    <p className='mt-2 text-sm font-semibold text-[#667085]'>
                      {typeof response.message === 'string' && response.message.trim()
                        ? response.message
                        : 'Everything is working correctly.'}
                    </p>
                  </div>
                </div>

                <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
                  {overviewItems.length > 0 ? (
                    overviewItems.map((item) => (
                      <DetailCard
                        key={item.label}
                        label={item.label}
                        value={
                          isPrimitive(item.value)
                            ? item.value
                            : JSON.stringify(item.value, null, 2)
                        }
                      />
                    ))
                  ) : (
                    <div className='rounded-[16px] border border-dashed border-[#D0D5DD] bg-white p-4 text-sm text-[#667085] md:col-span-2 xl:col-span-5'>
                      The readiness endpoint responded successfully, but it did not return the expected summary fields.
                    </div>
                  )}
                </div>

                <div className='mt-6'>
                  <div className='mb-3 text-sm font-black uppercase tracking-[0.08em] text-[#667085]'>
                    Readiness Checks
                  </div>
                  <ChecksSection checks={response.checks} />
                </div>
              </Fragment>
            ) : null}
          </div>
        </div>
      </section>
    </AuthBackground>
  );
}
