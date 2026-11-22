import { requirePrivacyAdministrator } from '@/server/auth';
import { prisma } from '@/server/db';
import { acknowledgeExternalDeletion } from './actions';
import { PrivacyControls } from './privacy-controls';
import { privacyLaunchBlockers } from '@/lib/privacy-retention';

export default async function PrivacyAdministration() {
  const actor = await requirePrivacyAdministrator();
  await prisma.privacyAudit.create({ data: { actorId: actor.id, scope: 'rights', action: 'administration_view' } });
  const recent = [
    ...await prisma.meetingRegistration.findMany({ orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, email: true } }).then(rows => rows.map(row => ({ ...row, scope: 'registration' }))),
    ...await prisma.corporateInquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, email: true } }).then(rows => rows.map(row => ({ ...row, scope: 'corporate' }))),
  ];
  const tasks = await prisma.privacyErasure.findMany({ where: { externalEmailIds: { not: null }, externalDoneAt: null }, orderBy: { createdAt: 'asc' } });
  return <div className="mx-auto max-w-4xl space-y-8 text-plum-800">
    <h1 className="text-2xl">პერსონალური მონაცემების მართვა</h1>
    <p className="rounded-xl bg-cream-200 p-5 text-sm leading-7">გაშვებამდე რეჟიმი. უფლებების მოთხოვნები მიიღება პოლიტიკაში მითითებული საკონტაქტო საშუალებებით. მოთხოვნის შესრულებამდე გადაამოწმე ვინაობა და უფლებამოსილება. მონაცემების ასლები არ გაგზავნო დაუდასტურებელ მიმღებთან.</p>
    <details className="rounded-xl border border-cream-300 p-5"><summary>გაშვების ბლოკერები: {privacyLaunchBlockers().length + tasks.length}</summary><ul className="mt-4 list-disc space-y-2 pl-5 text-sm">{privacyLaunchBlockers().map(blocker => <li key={blocker}>{blocker}</li>)}</ul><p className="mt-4 text-sm">გარემოს დადასტურების ნიშნულები პროვაიდერის გამართვას არ ცვლის. მათი გააქტიურება მხოლოდ რეალური პრაქტიკის გადამოწმების შემდეგ შეიძლება.</p></details>
    <PrivacyControls />
    <details className="rounded-xl border border-cream-300 p-5"><summary>ბოლო ჩანაწერები — კონფიდენციალური</summary><ul className="mt-4 space-y-3 text-sm">{recent.map(record => <li key={record.id} id={`${record.scope}-${record.id}`}>{record.scope}: {record.email} — მოძებნე ელფოსტით ზემოთ.</li>)}</ul></details>
    <section><h2 className="mb-4 text-xl">გარე ასლების წაშლის დავალებები</h2>
      <p className="mb-4 text-sm leading-7">მონაცემთა ბაზიდან წაშლა პროვაიდერისა და საფოსტო ყუთის ასლებს ავტომატურად არ შლის. შეასრულე წაშლა პროვაიდერთან/საფოსტო ყუთში და მხოლოდ შემდეგ დაადასტურე. დაუმთავრებელი დავალებები გაშვების ბლოკერია.</p>
      {tasks.length === 0 ? <p>მიმდინარე დავალებები არ არის.</p> : tasks.map(task => <form action={acknowledgeExternalDeletion} key={task.id} className="mb-4 rounded-xl border border-cream-300 p-5 text-sm">
        <input type="hidden" name="id" value={task.id} /><p>შეტყობინებების იდენტიფიკატორები: {task.externalEmailIds}</p>
        <label className="my-4 flex items-start gap-3"><input type="checkbox" name="confirmed" value="yes" required />გარე ასლები წაშლილია და შესრულება გადამოწმებულია.</label>
        <button className="rounded-full bg-mist-300 px-5 py-3">შესრულების აღრიცხვა</button>
      </form>)}
    </section>
  </div>;
}
