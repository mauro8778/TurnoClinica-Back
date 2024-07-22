interface appoimentDtos {
   
    date: string;
    time: string;
    status: 'active' | 'cancelled';
    description: string,
    userId:number

}

export default appoimentDtos;