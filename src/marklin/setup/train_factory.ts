import { Train } from "../../model/train";

export class TrainFactory {
    /**
     * Generate a train.
     */
    public static train(array: Train[], id: number) {
        array[id] = new Train(id);
    }
}
