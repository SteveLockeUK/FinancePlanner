export default function Title({ text }: { text: string }) {
    return (
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{text}</h2>
            <div className="h-1 bg-gradient-to-r from-primary-800 to-primary-500 rounded-full"></div>
          </div>
    )
}