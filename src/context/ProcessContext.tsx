import { createContext, useContext, useState, ReactNode } from "react";

interface ProcessData {
  text: string;
  file: File | null;
  disabilities: string[];
  grade: string;
  formats: string[];
  language: string;
  result: any;
  documentTitle?: string;
}

interface ProcessContextType {
  data: ProcessData;
  setData: (data: Partial<ProcessData>) => void;
}

const defaultData: ProcessData = {
  text: "",
  file: null,
  disabilities: [],
  grade: "Grade 6-10",
  formats: ["simplified"],
  language: "hi-IN",
  result: null,
};

const ProcessContext = createContext<ProcessContextType>({
  data: defaultData,
  setData: () => {},
});

export const ProcessProvider = ({ children }: { children: ReactNode }) => {
  const [data, setFullData] = useState<ProcessData>(defaultData);

  const setData = (newData: Partial<ProcessData>) => {
    setFullData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <ProcessContext.Provider value={{ data, setData }}>
      {children}
    </ProcessContext.Provider>
  );
};

export const useProcess = () => useContext(ProcessContext);
