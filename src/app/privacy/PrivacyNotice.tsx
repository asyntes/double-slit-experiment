'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  privacyContent,
  type PrivacyLanguage,
} from './content';

const LINK_PATTERN = /(info@asyntes\.com|https?:\/\/[^\s)]+|www\.garanteprivacy\.it)/g;

function LinkedText({ text }: { text: string }) {
  const parts = text.split(LINK_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (part === 'info@asyntes.com') {
          return (
            <a key={`${part}-${index}`} href="mailto:info@asyntes.com">
              {part}
            </a>
          );
        }

        if (part.startsWith('http://') || part.startsWith('https://')) {
          return (
            <a
              key={`${part}-${index}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        }

        if (part === 'www.garanteprivacy.it') {
          return (
            <a
              key={`${part}-${index}`}
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

export default function PrivacyNotice() {
  const [language, setLanguage] = useState<PrivacyLanguage>('en');
  const copy = privacyContent[language];

  useEffect(() => {
    if (navigator.language.toLowerCase().startsWith('it')) {
      setLanguage('it');
    }
  }, []);

  return (
    <main className="privacy-page min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[760px] px-5 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-white/75 transition-opacity hover:text-white hover:underline"
          >
            {copy.back}
          </Link>
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide">
            <button
              type="button"
              onClick={() => setLanguage('it')}
              className={`cursor-pointer transition-opacity ${language === 'it' ? 'text-white' : 'text-white/50 hover:text-white'}`}
              aria-pressed={language === 'it'}
            >
              IT
            </button>
            <span className="text-white/30" aria-hidden="true">
              /
            </span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`cursor-pointer transition-opacity ${language === 'en' ? 'text-white' : 'text-white/50 hover:text-white'}`}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>
        </div>

        <h1 className="mb-3 text-4xl font-bold leading-tight md:text-5xl">
          {copy.title}
        </h1>
        <p className="mb-7 text-sm text-white/60">{copy.updated}</p>
        <p className="mb-10 text-base leading-relaxed text-white/90 md:text-[1.0625rem]">
          <LinkedText text={copy.intro} />
        </p>

        {copy.sections.map((section) => (
          <section key={section.title} className="mb-9 last:mb-0">
            <h2 className="mb-3.5 text-xl font-semibold">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-3.5 text-base leading-relaxed text-white/90 last:mb-0 md:text-[1.0625rem]"
              >
                <LinkedText text={paragraph} />
              </p>
            ))}
            {section.items && section.items.length > 0 && (
              <ul className="mt-2 ml-[1.15rem] flex flex-col gap-3">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="text-base leading-relaxed text-white/90 md:text-[1.0625rem]"
                  >
                    <LinkedText text={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
