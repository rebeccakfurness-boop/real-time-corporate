import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrackReportForm } from './track-report-form';

export default function EmployeeSpeakUpPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Speak Up</h1>
        <p className="text-sm text-muted-foreground">
          A confidential, anonymous way to raise concerns. Leaders only ever see de-identified case information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Submit a new report</CardTitle>
          <CardDescription>You choose whether to stay anonymous or identify yourself.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/speak-up/submit">Submit a report</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold">Track an existing report</CardTitle>
          <CardDescription>Enter the tracking code you received when you submitted your report.</CardDescription>
        </CardHeader>
        <CardContent>
          <TrackReportForm />
        </CardContent>
      </Card>
    </div>
  );
}
