export default function Skeleton({
  width = "100%",
  height = "20px",
  radius = "12px",
}) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}
