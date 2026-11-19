import HeartPosition from '../enums/HeartPosition';
import HeartShape from '../enums/HeartShape';
import {
  CLOSING_LINE,
  CLOSING_LINE_ROTATION_DEG,
  GREETING_PARAGRAPHS,
  SIGNATURE_LINE,
  SIGNATURE_LINE_ROTATION_DEG,
} from '../data/InvitationData';
import HeartStickerView from './HeartStickerView';

const HEART_PARAGRAPH_INDEX = 1;

const getRotationStyle = (rotationDeg: number) => {
  return { transform: `rotate(${rotationDeg}deg)` };
};

const GreetingView = () => {
  return (
    <section className="greeting" data-testid="greeting" aria-label="인사말">
      {GREETING_PARAGRAPHS.map((lines, paragraphIndex) => {
        const isHeartParagraph = paragraphIndex === HEART_PARAGRAPH_INDEX;

        return (
          <p className="greeting__paragraph" key={lines[0].text}>
            {isHeartParagraph && <HeartStickerView position={HeartPosition.GREETING_LEFT} shape={HeartShape.SINGLE} />}
            {lines.map((line) => (
              <span className="greeting__line" key={line.text} style={getRotationStyle(line.rotationDeg)}>
                {line.text}
              </span>
            ))}
          </p>
        );
      })}
      <p className="greeting__paragraph greeting__closing">
        <span className="greeting__line" style={getRotationStyle(CLOSING_LINE_ROTATION_DEG)}>
          {CLOSING_LINE}
        </span>
        <span className="greeting__line" style={getRotationStyle(SIGNATURE_LINE_ROTATION_DEG)}>
          {SIGNATURE_LINE}
        </span>
      </p>
    </section>
  );
};

export default GreetingView;
