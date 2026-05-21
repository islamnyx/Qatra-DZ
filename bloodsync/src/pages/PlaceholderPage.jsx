export default function PlaceholderPage({ title, description }) {
  return (
    <div className="card max-w-lg p-8 text-center">
      <h2 className="text-lg font-medium text-primary">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <p className="mt-4 text-xs text-gray-400">Optional module — extend in next sprint</p>
    </div>
  );
}
