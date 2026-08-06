
export interface Operator {
  id: string;           
  name: string;         
  registration: string; 
  city?: string;        
  createdAt?: string;   
}

export interface CreateOperatorInput {
  name: string;         
  registration: string; 
  city?: string;        
  password?: string;    
}

export interface UpdateOperatorInput {
  name?: string;
  registration?: string;
  city?: string;
  password?: string;
}