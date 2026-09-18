export type PrivacyLanguage = 'it' | 'en';

export type PrivacySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type PrivacyCopy = {
  title: string;
  updated: string;
  back: string;
  intro: string;
  sections: PrivacySection[];
};

export const privacyContent: Record<PrivacyLanguage, PrivacyCopy> = {
  it: {
    title: 'Informativa privacy',
    updated: 'Ultimo aggiornamento: 18 settembre 2026',
    back: 'Torna alla simulazione',
    intro:
      'Questa informativa descrive come vengono trattati i dati personali in relazione alla simulazione Double Slit Experiment (https://double-slit.vercel.app), ai sensi del Regolamento (UE) 2016/679 (GDPR) e della normativa italiana applicabile.',
    sections: [
      {
        title: 'Titolare del trattamento',
        paragraphs: [
          'Il titolare del trattamento è Antonio Santese (Asyntes).',
          'Per qualsiasi richiesta: info@asyntes.com.',
        ],
      },
      {
        title: 'Quali dati vengono trattati',
        paragraphs: [
          'Il sito è una simulazione 3D educativa dell’esperimento della doppia fenditura. Non ci sono moduli di contatto, iscrizioni, account o pagamenti. La simulazione gira interamente nel browser e non invia i dati dell’esperimento a un server.',
        ],
        items: [
          'Dati di navigazione: il sito è ospitato su Vercel. Vercel può registrare log tecnici (indirizzo IP, user-agent, URL della richiesta, data e ora) per sicurezza e funzionamento dell’infrastruttura. Il titolare non usa questi log per analizzare, profilare o tracciare i visitatori.',
          'Email: se scrivi a info@asyntes.com, tratto l’indirizzo email, il contenuto del messaggio e gli eventuali dati che includi, solo per risponderti.',
        ],
      },
      {
        title: 'Finalità e basi giuridiche',
        items: [
          'Fornire e proteggere il sito (interesse legittimo, art. 6, par. 1, lett. f GDPR).',
          'Rispondere alle email (misure precontrattuali o interesse legittimo, art. 6, par. 1, lett. b e f GDPR).',
        ],
      },
      {
        title: 'Cookie e tecnologie simili',
        paragraphs: [
          'Non uso cookie di profilazione, statistica o marketing, né script di terze parti per il tracciamento. Non è necessario alcun banner di consenso.',
          'Non viene usato localStorage né altre tecnologie simili per salvare preferenze o identificatori.',
        ],
      },
      {
        title: 'Destinatari',
        paragraphs: [
          'Oltre al titolare, i dati di navigazione possono essere trattati da Vercel Inc. in qualità di fornitore di hosting.',
          'Il collegamento a GitHub apre un sito di terze parti, a cui si applica la rispettiva informativa.',
          'I caratteri tipografici sono ospitati sul sito: durante la visita non vengono richiesti font a Google o ad altri CDN.',
        ],
      },
      {
        title: 'Trasferimenti extra-SEE',
        paragraphs: [
          'Vercel è un fornitore con sede negli Stati Uniti e aderisce al Data Privacy Framework UE-USA.',
          'Informativa privacy di Vercel: https://vercel.com/legal/privacy-policy',
        ],
      },
      {
        title: 'Conservazione',
        items: [
          'Log di hosting: secondo le policy di Vercel.',
          'Email: per il tempo necessario a gestire la richiesta e gli eventuali obblighi di legge.',
        ],
      },
      {
        title: 'I tuoi diritti',
        paragraphs: [
          'Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei dati, e proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
          'Per esercitare i diritti: info@asyntes.com.',
        ],
      },
      {
        title: 'Aggiornamenti',
        paragraphs: [
          'Questa informativa può essere modificata. La data di ultimo aggiornamento è indicata in cima alla pagina.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy notice',
    updated: 'Last updated: 18 September 2026',
    back: 'Back to the simulation',
    intro:
      'This notice describes how personal data is processed in relation to the Double Slit Experiment simulation (https://double-slit.vercel.app), under Regulation (EU) 2016/679 (GDPR) and applicable Italian law.',
    sections: [
      {
        title: 'Data controller',
        paragraphs: [
          'The data controller is Antonio Santese (Asyntes).',
          'For any request: info@asyntes.com.',
        ],
      },
      {
        title: 'What data is processed',
        paragraphs: [
          'This site is an educational 3D simulation of the double-slit experiment. There are no contact forms, sign-ups, accounts, or payments. The simulation runs entirely in the browser and does not send experiment data to a server.',
        ],
        items: [
          'Browsing data: the site is hosted on Vercel. Vercel may record technical logs (IP address, user-agent, request URL, date and time) for security and infrastructure operation. The controller does not use these logs to analyse, profile, or track visitors.',
          'Email: if you write to info@asyntes.com, I process your email address, the message content, and any data you include, solely to reply.',
        ],
      },
      {
        title: 'Purposes and legal bases',
        items: [
          'Providing and protecting the site (legitimate interest, Art. 6(1)(f) GDPR).',
          'Replying to emails (pre-contractual steps or legitimate interest, Art. 6(1)(b) and (f) GDPR).',
        ],
      },
      {
        title: 'Cookies and similar technologies',
        paragraphs: [
          'I do not use profiling, analytics, or marketing cookies, nor third-party tracking scripts. No consent banner is required.',
          'localStorage and similar technologies are not used to store preferences or identifiers.',
        ],
      },
      {
        title: 'Recipients',
        paragraphs: [
          'Besides the controller, browsing data may be processed by Vercel Inc. as hosting provider.',
          'The GitHub link opens a third-party site, which has its own privacy notice.',
          'Fonts are hosted on this site: the visit does not request fonts from Google or other CDNs.',
        ],
      },
      {
        title: 'Transfers outside the EEA',
        paragraphs: [
          'Vercel is a US-based provider and participates in the EU-US Data Privacy Framework.',
          'Vercel privacy policy: https://vercel.com/legal/privacy-policy',
        ],
      },
      {
        title: 'Retention',
        items: [
          'Hosting logs: according to Vercel’s policies.',
          'Emails: for as long as needed to handle the request and any legal obligations.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: [
          'You may request access, rectification, erasure, restriction, objection, and data portability, and lodge a complaint with the Italian Data Protection Authority (www.garanteprivacy.it).',
          'To exercise your rights: info@asyntes.com.',
        ],
      },
      {
        title: 'Updates',
        paragraphs: [
          'This notice may be updated. The last-updated date is shown at the top of the page.',
        ],
      },
    ],
  },
};
