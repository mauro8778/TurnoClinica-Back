interface iAppoiment {
    id: number,
    date: string,
    time: number,
    userId: number,
    status: 'active' | 'cancelled'
}

export default iAppoiment;