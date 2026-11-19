import { useRef, type CSSProperties } from 'react';
import { INTRODUCING_LINES } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import useScrollProgress from '../../hooks/useScrollProgress';
import LaunchSectionView from './LaunchSectionView';

interface IntroducingWord {
  text: string;
  // Position in the whole sentence; CSS uses it to stagger the light-up.
  order: number;
}

const INTRODUCING_WORD_LINES: IntroducingWord[][] = INTRODUCING_LINES.reduce<IntroducingWord[][]>(
  (lines, line) => {
    const previousCount = lines.flat().length;
    const words = line.split(' ').map((text, index) => ({ text, order: previousCount + index }));

    return [...lines, words];
  },
  [],
);

const SENTENCE_STYLE = { '--intro-word-count': INTRODUCING_WORD_LINES.flat().length } as CSSProperties;

// --intro-progress (0 → 1) is written on the section by useScrollProgress; each word derives its
// brightness from it and its --word-index in LaunchPage.css, so scrolling never re-renders React.
const IntroducingView = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollProgress(sectionRef, '--intro-progress');

  return (
    <LaunchSectionView ref={sectionRef} label="소개" tone={LaunchSectionTone.BLACK} className="launch-intro">
      <div className="launch-intro__stage">
        <p className="launch-intro__eyebrow">Introducing</p>
        <p className="launch-intro__sentence" style={SENTENCE_STYLE}>
          {INTRODUCING_WORD_LINES.map((words) => (
            <span key={words[0]?.order} className="launch-intro__line">
              {words.map((word) => {
                const wordStyle = { '--word-index': word.order } as CSSProperties;

                return (
                  <span key={word.order} className="launch-intro__word" style={wordStyle}>
                    {`${word.text} `}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </LaunchSectionView>
  );
};

export default IntroducingView;
