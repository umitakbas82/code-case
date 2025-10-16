export interface Task {
    id: number;
    userId: number;
    imageUrl: string;
    status: 'pending' | 'completed';
}