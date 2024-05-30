"use client";

import 'reactflow/dist/style.css';
import { ReactFlowProvider } from 'reactflow';
import Graph from '@/components/build/graph';
import { GraphContextProvider } from '@/contexts/graph';

export default () => (
    <ReactFlowProvider>
        <GraphContextProvider>
            <Graph />
        </GraphContextProvider>
    </ReactFlowProvider>
);
