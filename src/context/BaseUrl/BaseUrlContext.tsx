import React, {createContext , useContext , useState , ReactNode} from "react";

interface BaseUrlContextType {
    baseUrl : string,
    setBaseUrl: (url: string) => void;
}

const BaseUrlContext = createContext<BaseUrlContextType | undefined>(undefined);

export const BaseUrlProvider: React.FC<{children:ReactNode}> = ({children}) => {
    const [baseUrl , setBaseUrl] = useState<string>("http://localhost:3300/api");

    return (
        <BaseUrlContext.Provider value={{baseUrl , setBaseUrl}}>
            {children}
        </BaseUrlContext.Provider>
    )
};

export const useBaseUrl = (): BaseUrlContextType => {
    const context = useContext(BaseUrlContext);

    if(!context){
        throw new Error('useBaseUrl must be used within a BaseUrlProvider');
        
    }
    return context;
}