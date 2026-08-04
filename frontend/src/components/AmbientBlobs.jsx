export default function AmbientBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-soft blur-3xl opacity-70 animate-drift" />
      <div
        className="absolute top-40 -right-24 w-96 h-96 rounded-full bg-lavender-soft blur-3xl opacity-70 animate-drift"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-mint-soft blur-3xl opacity-60 animate-drift"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}
