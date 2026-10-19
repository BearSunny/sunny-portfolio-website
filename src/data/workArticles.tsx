import React from 'react';

export interface WorkArticle {
  id: string;
  title: string;
  date: string;
  logo: string;
  content: React.ReactNode;
}

export const WORK_ARTICLES: Record<string, WorkArticle> = {
  'open-library': {
    id: 'open-library',
    title: 'Patron-Centric Carousel Filtering',
    date: 'May 2026',
    logo: '/images/open-library.png',
    content: (
      <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-black">

        <p>
          <strong>How do you let patrons shape a homepage that looks the same for everyone?</strong>
        </p>
        <p>
          Open Library's homepage is a set of carousels, the starting point of book discovery, and patrons could only scroll through them. I built a global filter that lets them narrow every carousel to the books they can actually read. It is on track to ship by the end of 2026.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">My role</h3>
        <p>
          I picked this up from an open issue after months of reading the codebase and fixing small bugs, and my mentor agreed to assign it to me. From there I owned it end to end: I built the filter UI, which changed a lot along the way, added a handler for DOM events to capture user input, stored preferences in localStorage and cookies, wired them into Solr queries, and wrote unit tests for the logic.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Problem: carousels were look-only</h3>
        <p>
          Patrons had no way to interact with or customize the carousels, even though carousels are where most book discovery begins. I felt this from the patron side too. As a reader in Vietnam, I found many of my books on Open Library, and carousels have always been very important for readers like me.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Decision: localStorage as the source of truth, cookies for compatibility</h3>
        <p>
          Preferences live in localStorage under <code>preferences.global</code>, so the homepage updates carousels instantly with no server round trip. But the account code already wrote <code>ol_mode</code> and <code>ol_lang</code> cookies. On first load, if localStorage has no global entry, the code reads those cookies, converts them to the new format, and writes them back. Existing users keep their settings.
        </p>

        <figure className="my-6 max-w-xs mx-auto">
          <img
            src="/images/cookies_localStorage.png"
            alt="Diagram of cookies migrating into localStorage and updating carousels"
            className="w-full rounded-lg"
          />
          <figcaption className="mt-2 text-center text-xs text-gray-500">
            Cookie → localStorage → carousel update.
          </figcaption>
        </figure>

        <h3 className="text-sm sm:text-base font-semibold">Decision: follow the existing pattern for Solr</h3>
        <p>
          I reused the carousel <code>loadMore</code> behavior for sending Solr queries and added the filter parameters. That keeps filtered and unfiltered carousels consistent and avoids a second query path to maintain.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Decision: move out of the IA bar, then reuse the new components</h3>
        <p>
          My first version was a new component in the IA bar. My mentor pointed out it wouldn't be visible there, so I moved it to the main page. Around then, a senior designer joined Open Library and built custom Lit components, so I rebuilt the filter with them instead of keeping my own.
        </p>

        <div className="my-6 grid grid-cols-2 gap-2 sm:gap-4 items-start">
          <figure>
            <img
              src="/images/openlib-ia.png"
              alt="First version of the filter in the IA bar"
              className="w-full rounded-lg"
            />
            <figcaption className="mt-2 text-center text-xs text-gray-500">
              First version, in the IA bar.
            </figcaption>
          </figure>
          <figure>
            <img
              src="/images/ol-after.png"
              alt="Final version of the filter on the homepage"
              className="w-full rounded-lg"
            />
            <figcaption className="mt-2 text-center text-xs text-gray-500">
              Final version, on the homepage.
            </figcaption>
          </figure>
        </div>

        <h3 className="text-sm sm:text-base font-semibold">Decision: cut scope</h3>
        <p>
          The first design also had time range and language filters. I dropped both as unnecessary and kept a single readable-only toggle that controls every carousel. I dropped the language filter because it would stack on top of the browser-language filter the carousels already apply server-side. For patrons whose language is on the existing shortlist it adds nothing, and for patrons whose language isn’t, it would layer a sparse language onto already-narrow homepage queries and leave carousels empty, which is the very reason the shortlist exists.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Reflection</h3>
        <p>
          <strong>Feedback shaped this feature more than code did.</strong> My lead designer and mentor refined it throughout, and the version that ships looks different from the one I started with. Development here is less about showing off technical skill and more about aligning with the people involved and the current state of the site.
        </p>
        <p>
          <strong>In open source, being active is how you get unblocked.</strong> There is no fixed timeline, and a project can take 6 weeks or 6 months depending on mentor availability. So I organized feedback slots myself and asked other fellows and staff for help on the parts I didn't know.
        </p>
      </div>
    ),
  },

  'apcs-ta': {
    id: 'apcs-ta',
    title: 'Critical Thinking In Practice',
    date: 'October 2025',
    logo: '/images/apcs-logo.png',
    content: (
      <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-black">
        <p>
          <strong>How do you teach critical thinking to students who would rather be coding?</strong>
        </p>
        <p>
          I mentor 85+ students through two course projects, a turning-point image project and a final film, alongside the Professor and the TA team.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">My role</h3>
        <p>
          Each week I meet students in person to discuss their work and debate it. During the week I follow up online, so advice and corrections arrive early instead of at the deadline.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Debate over lecture</h3>
        <p>
          I enjoy debating with students because they sometimes show me perspectives I hadn't considered, and it sharpens how I teach. It also practices what the course is about: being able to logically defend an idea, but also flexible enough to change your mind when new evidence arrives.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Small, fast feedback loops</h3>
        <p>
          Weekly meetings are for depth. Chat is for quick advice, so a misunderstanding doesn't carry on for a week. I also work with the Professor and TA team to test and refine class exercises.
        </p>

        <p>
          <strong>Critical thinking comes before technical skill.</strong> CM102 isn&apos;t a technical course, but it teaches how to think critically, and I find that more important than ever in this tumultuous time. Students, myself included, tend to chase technical details and forget that a sharp mind with good reasoning has to come first. Watching my students grow in their reasoning and maturity as they approach problems is what I enjoy most about mentoring, and I&apos;d love to see this being taught more widely.
        </p>
      </div>
    ),
  },

  'green-ocean': {
    id: 'green-ocean',
    title: 'Green Ocean Crew Management App',
    date: 'September 2026',
    logo: '/images/green-ocean-logo.png',
    content: (
      <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-black">
        <p>
          <strong>How do you replace a process that lives in chat messages and spreadsheets?</strong>
        </p>
        <p>
          Crewmen shared their details over Zalo chat, employees retyped them into Google Sheets or Excel, and every missing document meant another chat. We built a Zalo Mini App for crewmen and a web portal for HR, to serve 500+ crewmen.
        </p>

        <figure className="my-6">
          <img
            src="/images/zalo_to_green.gif"
            alt="Green Ocean Group Zalo Mini App Flow"
            className="mx-auto w-full max-w-[260px] sm:max-w-xs rounded-lg"
          />
          <figcaption className="mt-2 text-center text-xs text-gray-500">
            One central hub for all crew data.
          </figcaption>
        </figure>

        <h3 className="text-sm sm:text-base font-semibold">My role</h3>
        <p>
          In a team of two, I led UI/UX and frontend across both interfaces and designed the PostgreSQL schema. My teammate owned the OCR flow and most of the backend.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Problem: information scattered across chats and spreadsheets</h3>
        <p>
          Data was retyped by hand, and documents were requested one chat at a time. Information that lived in chats could also disappear when crewmen deleted it after leaving the company.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Decision: a Zalo Mini App, not a standalone app</h3>
        <p>
          Everyone already communicates through Zalo, so we put the app where crewmen already are, with nothing new to install or learn to find.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Decision: simple words, simple screens, no animation</h3>
        <p>
          Crewmen are not heavy tech users, so I rejected animations and kept the wording plain. Whatever I want a user to do, the screen says it outright. Clear instructions in the descriptions were my first priority, ahead of how the screen looks.
          I also focus on reducing user effort. Whenever information can be surfaced or prefilled through the UI instead of requiring manual input, I design for that, such as with this phone header input.
        </p>
 
        <div className="my-6 grid grid-cols-2 gap-2 sm:gap-4 items-start">
          <figure>
            <img
              src="/images/description.png"
              alt="A Mini App screen with a clear instruction on how to input ID card"
              className="w-full rounded-lg"
            />
            <figcaption className="mt-2 text-center text-xs text-gray-500">
              One screen and a clear instruction on how to input ID card. 
            </figcaption>
          </figure>

          <figure>
            <img
              src="/images/phone.png"
              alt="A Mini App screen with a clear instruction on how to input ID card"
              className="w-full rounded-lg"
            />
            <figcaption className="mt-2 text-center text-xs text-gray-500">
              Parkinson's law in application. 
            </figcaption>
          </figure>
        </div>
 
        <h3 className="text-sm sm:text-base font-semibold">Decision: toasts for progress, modals for warnings</h3>
        <p>
          Without animation to guide attention, feedback has to come from two deliberate signals, and each one has a single job.
        </p>
        <p>
          <strong>Toasts confirm what just happened.</strong> They matter because the upload and re-upload flows reuse the same progress bar. If that progress reset abruptly, crewmen would have no way to understand that there are two flows, so a toast explains each change as it happens.
        </p>
        <p>
          <strong>Modals handle warnings.</strong> They are reserved for moments when a crewman needs to stop, read, and decide before continuing. For example, this modal alerts crew members that the photos they uploaded are of insufficient quality and specifies which images need to be reuploaded.
        </p>
        <div className="my-6 grid grid-cols-2 gap-2 sm:gap-4 items-start">
          <figure>
            <img
              src="/images/green-toast.png"
              alt="A toast confirming progress in the upload flow (sample data)"
              className="w-full rounded-lg"
            />
            <figcaption className="mt-2 text-center text-xs text-gray-500">
              Toast: explaining progress.
            </figcaption>
          </figure>
          <figure>
            <img
              src="/images/warning-error.png"
              alt="A modal warning in the Mini App (sample data)"
              className="w-full rounded-lg"
            />
            <figcaption className="mt-2 text-center text-xs text-gray-500">
              Modal: warning with a clear description.
            </figcaption>
          </figure>
        </div>

        <h3 className="text-sm sm:text-base font-semibold">Decision: a separate upload flow for each document type</h3>
        <p>
          One generic upload would have been faster to build, but I made a separate flow per document type instead. It takes more time, but it keeps information from clustering and makes it clear what each upload is for. Re-uploads have their own dedicated flow too.
        </p>

        <p>
          <strong>The normal flow:</strong> the crewman selects a document type, uploads an image of the document, and waits while OCR extracts the details. They then review and confirm the information, or flag corrections for admin review.
        </p>
        <p>
          <strong>Re-uploads:</strong> on the homepage, the crewman sees each document's current status. If a document is rejected or needs replacing, a Re-upload action appears. It opens the same upload screen, where they choose a new image, let OCR run again, and review the newly extracted details. They then confirm or flag them, and the document goes back into admin review.
        </p>

        <h3 className="text-sm sm:text-base font-semibold">Decision: a schema built around the crewman journey</h3>
        <p>
          Crewmen upload documents once during onboarding, and the records live in a database instead of fragmented spreadsheets. I designed the PostgreSQL schema around crew profiles, job applications, next-of-kin information, and certificate submissions, with clear relationships between them.
        </p>

        <figure className="my-6">
          <img
            src="/images/database.png"
            alt="Simplified ER diagram of crew profiles, applications, next-of-kin, and certificates"
            className="w-full rounded-lg"
          />
          <figcaption className="mt-2 text-center text-xs text-gray-500">
            A simplified view of the schema.
          </figcaption>
        </figure>

        <h3 className="text-sm sm:text-base font-semibold">Reflection</h3>
        <p>
          <strong>Design for the least tech-comfortable user.</strong> Every choice here, from plain wording to input flow to one upload flow per document, came from asking what a crewman on a phone would find easiest, not what I found most aesthetic.
        </p>
        <p>
          <strong>A production-ready app takes careful planning.</strong> Every step has to be explained, and every step has to make sense. If I couldn’t say why a screen or a field was there, it simply didn’t belong. This, of course, entailed a lot of issues along the way, but good things take time and care, even if they're a bit fragile in the process.
        </p>

        <p className="text-xs text-gray-500 italic border-t border-gray-300 pt-3">As the work is still ongoing, a comprehensive report will be available later!</p>
      </div>
    ),
  },
};