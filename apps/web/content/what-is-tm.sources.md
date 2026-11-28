# Georgian TM introduction: editorial coverage

Existing URL: `/blog/ra-aris-transtsendentuli-meditatsia`.

Primary reference reviewed on 2026-10-20: <https://tm.org/en-us/what-is-tm>.
Both its extracted text and rendered page were reviewed. No source images were saved or imported.

## Coverage

| Source topic | Georgian article section | Treatment |
| --- | --- | --- |
| What TM is; effortless practice | Opening paragraph; როგორ მუშაობს | Retains the original opening and explains effortlessness without promising an outcome. |
| Personalized instruction by certified teachers | ინდივიდუალური სწავლება სერტიფიცირებულ მასწავლებელთან | Explains personal instruction, the role of a mantra, verification, and continuing support. |
| Not a religion or belief system | რას არ წარმოადგენს TM? | Attributes these descriptions to the TM organization. |
| Difference from other meditation techniques | რით განსხვავდება სხვა მედიტაციური მიდგომებისგან? | Explains the difference in approach without asserting universal superiority or equivalence. |
| Settling of mental activity; transcendence | გონების დამშვიდება და ტრანსცენდირება | Distinguishes reduced mental activity from sleep or loss of awareness. |
| How it works: the mind's natural tendency | Same section | Uses the written explanation only; does not reconstruct Mario Orsatti's video. |
| Pure Consciousness; Natural Law | Same section and its H3 | Uses the official FAQ and published Maharishi interview; clearly identifies philosophical language. |
| Restful alertness; Transcendental Consciousness | ღრმა დასვენება და ფხიზელი ცნობიერება | Describes the organizational terminology and distinguishes experience, measurements, and interpretations. |
| Physiology and brain functioning | რას აღწერს წყარო ფიზიოლოგიისა და ტვინის შესახებ? and its H3s | Covers the official page's respiratory, muscular, cortisol, arterial-lactate, skin-response, blood-flow, and brain-integration statements with attribution. Clarifies resistance vs. conductance using indexed primary-study abstracts. |
| Research scope and limits | Same section | The 480+ figure is explicitly the organization's count, not an independent literature audit. No guaranteed effects or claim that EEG proves a philosophical theory. |
| Maharishi Mahesh Yogi | მაჰარიში მაჰეშ იოგი და TM-ის საერთაშორისო გავრცელება | Teaching, international work from 1958, teacher training, and nonprofit organizations. |
| Dr. Tony Nader | დოქტორი ტონი ნეიდერი და საერთაშორისო ორგანიზაცია | Medical/neuroscience background, succession, and international leadership; institutional claims are attributed. |
| Independent reading; introductory discussion; learning | შემდეგი ნაბიჯი: გაცნობიდან სწავლამდე; final CTA | Reuses `/#why` and `/#contact`. US course details are identified as such, not promised as a local Georgian service. |

## Additional written sources consulted

- Official FAQ: <https://tm.org/en-us/faq>
- Official course description: <https://tm.org/en-us/tm-course>
- Maharishi Foundation: <https://tm.org/en-us/nonprofit>
- TM Canada, institutional history and leadership: <https://ca.tm.org/en/about>
- Published excerpts of a 1993 Maharishi interview: <https://usa.tm.org/blog/maharishi/settled-state/>
- Wallace, 1970, indexed abstract: <https://pubmed.ncbi.nlm.nih.gov/5416544/>
- Travis and Wallace, 1999, indexed abstract: <https://pubmed.ncbi.nlm.nih.gov/10487785/>

## Excluded material and verification limits

- Excluded the Emily Fitz Randolph and Fred Travis video interviews, Mario Orsatti explanatory video, and the Noah Schechtman, Lindsay, and Raisa Martinez video testimonials.
- No players, thumbnails, play controls, video carousels, spoken transcripts, or empty media placeholders were added.
- Relevant written explanations surrounding the videos are covered; unwritten video content was not inferred.
- Source navigation, newsletter/signup UI, advertising/promotion, and testimonial quotes are not educational article sections and were not reproduced.
- The primary page's written material was fully accessible. Research abstracts were available through indexed primary-publication records; full papers were not reviewed. The official page does not identify a separate supporting study for every physiological statement, so those remain explicitly attributed source claims rather than independently verified conclusions.
- No local course timetable, booking availability, teaching credentials, or contact details were independently verified. The final CTA uses the existing contact destination, not a newly invented booking system.

## Applying this targeted CMS update

The article remains editable in the existing CMS. Its identity, title, cover, author, publication date, status, and existing excerpt field are preserved.

From the repository root, run:

```powershell
pnpm.cmd --filter @tm/web exec tsx scripts/update-what-is-tm.ts
```

This explicit command updates only the body and format of the existing article, backs up its previous body outside the repository, and refuses to overwrite a concurrent edit. It never creates an article, runs seeds, or runs during normal startup. Reading time continues to be calculated from the article content by the existing service.
