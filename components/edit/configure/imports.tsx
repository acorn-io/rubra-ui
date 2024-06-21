import { useState, useEffect } from "react";
import {
    Input,
    Button,
    input,
} from "@nextui-org/react";
import { debounce, set } from "lodash"
import { GoTrash } from "react-icons/go";

interface ExternalProps {
    tools: string[] | undefined;
    setTools: (tools: string[]) => void;
    label: string;
    className?: string;
    description?: string;
}

const Imports: React.FC<ExternalProps> = ({tools, setTools, label, className, description}) => {
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [input, setInput] = useState<string>("");
    
    const search = debounce((query: string) => {
        setLoading(true);
        fetch(`https://tools.gptscript.ai/api/search?q=${query}&limit=50`)
            .then(response => response.json())
            .then((result: any) => {
                setResults(Object.keys(result.tools));
            })
            .then(() => setLoading(false))
            .catch(err => console.error(err));
    }, 500);

    useEffect(() => search("gptscript-ai"), [])

    const handleDeleteTool = (tool: string) => {
        const updatedTools = tools!.filter((t) => t !== tool);
        setTools(updatedTools);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (tools?.includes(input)) {
                setError(`Tool ${input} has already been imported`);
                return;
            }
            if (!input) {
                setError("Tool cannot be empty");
                return;
            }
            setTools([...tools || [], e.currentTarget.value]);
            setInput("");
        }
    };

    return (
        <div className={`${className}`}>
            <h1 className="mb-2 capitalize">{label+'s'}</h1>
            <h2>{description}</h2>
            {tools && tools.length > 0 && (
                <div className="grid grid-cols-1 gap-2 w-full mb-2">
                    {tools.map((tool) => (
                        <div
                            className="w-full border-2 dark:border-zinc-800 text-sm pl-2 rounded-lg flex items-center justify-between"
                        >
                            <p className="truncate">{tool}</p>
                            <div className="">
                                <Button
                                    className="w-1/6 ml-2 h-[28px]"
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    startContent={<GoTrash/>}
                                    onPress={() => handleDeleteTool(tool)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex w-full h-full">
                <Input
                    size="sm"
                    variant="bordered"
                    id="toolInput"
                    autoComplete='off'
                    placeholder={`Enter a URL or custom tool...`}
                    isInvalid={error !== null}
                    errorMessage={error}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {setError(null); setInput(e.currentTarget.value)}}
                    value={input}
                />
            </div>
        </div>
    );
};

export default Imports;