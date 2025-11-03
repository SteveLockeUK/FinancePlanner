import Title from "./Title"

interface CardProps {
    children?: React.ReactNode
    title: string
}

export default function Card({ children = null, title }: CardProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 border border-gray-100">
            <Title text={title} />
            {children ?? <></>}
        </div>
    )
}