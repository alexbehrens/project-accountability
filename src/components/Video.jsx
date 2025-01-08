import { DailyVideo } from "@daily-co/daily-react";

export const Video = ({ id, className = "", tileClassName = "" }) => {
  return (
    <div className={className}>
      <DailyVideo
        sessionId={id}
        automirror
        className={tileClassName}
      />
    </div>
  );
};

export default Video; 