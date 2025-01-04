import ReactMarkdown from 'react-markdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MarkdownRendererProps {
  content: string | null | undefined;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  if (!content) return null;
  const contentString = String(content);
  if (!contentString.trim()) return null;

  const processTable = (tableContent: string) => {
    const rows = tableContent.split('\n').filter(row => row.trim());
    const headers = rows[0].split('|').filter(cell => cell.trim());
    const data = rows.slice(2).map(row => row.split('|').filter(cell => cell.trim()));

    return (
      <div className="my-4 overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, i) => (
                <TableHead key={i} className="font-semibold">
                  {header.trim()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell.trim()}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="text-base leading-relaxed mb-4 text-foreground">{children}</p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline transition-colors"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-primary-900 dark:text-primary-100">
            {children}
          </strong>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-base leading-relaxed">{children}</li>
        ),
        table: ({ children }) => processTable(String(children)),
      }}
    >
      {contentString}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;