import "./Message.css";

interface MessageProps {
  text: string;
  type?: "info" | "error";
}

export const Message = ({ text, type = "info" }: MessageProps) => {
  const className = `message ${type === "error" ? "message-error" : ""}`;
  return <div className={className}>{text}</div>;
};
