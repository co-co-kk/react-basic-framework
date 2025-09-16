export default function About() {
  return (
    <div className="h-full w-full">
      {Array(100).fill(0).map((_, index) => (
        <h1 key={index} className="text-2xl font-bold">ℹ️ About Page {index}</h1>
      ))}
    </div>
  );
}
