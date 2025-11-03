import Title from "@/components/ui/Title"

interface CardProps {
    children?: React.ReactNode
    title: string
}

export default function Card({ children = null, title }: CardProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 border border-gray-100 mb-4">
            <h2>{title}</h2>
            {children ?? <></>}
        </div>
    )
}