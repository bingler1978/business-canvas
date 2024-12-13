import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

interface MarkdownPreviewProps {
  content: string;
}

const PreviewContainer = styled.div`
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 60vh;
  overflow-y: auto;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    color: #333;
  }

  p {
    margin: 0.5em 0;
    line-height: 1.6;
    color: #444;
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  li {
    margin: 0.3em 0;
    line-height: 1.6;
  }

  code {
    background: #f5f7f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
    color: #476582;
  }

  pre {
    background: #f5f7f9;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
  }

  pre code {
    background: none;
    padding: 0;
  }

  blockquote {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid #42b983;
    background: #f8f8f8;
    color: #666;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background: #f5f7f9;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  hr {
    border: none;
    border-top: 1px solid #eaecef;
    margin: 1em 0;
  }

  a {
    color: #42b983;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <PreviewContainer>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </PreviewContainer>
  );
};

export default MarkdownPreview;
