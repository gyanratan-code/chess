export default class Clock {
    private remainingTime: number;
    private intervalId?: NodeJS.Timeout;
    private endedPromise?: Promise<void>;
    private endedResolve?: () => void;

    constructor(initialTime: number) {
        this.remainingTime = initialTime;
        this.startCountdown();
    }

    private startCountdown() {
        this.endedPromise = new Promise<void>((resolve) => {
            this.endedResolve = resolve;
        });

        this.intervalId = setInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;
                console.log(`Time left: ${this.remainingTime} seconds`);
            } else {
                this.stopCountdown();
                console.log("Timer ended.");
                if (this.endedResolve) {
                    this.endedResolve();
                }
            }
        }, 1000);
    }

    stopCountdown() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    addTime(seconds: number) {
        this.remainingTime += seconds;
        console.log(`Added ${seconds} seconds. New time: ${this.remainingTime} seconds`);
    }

    hasEnded(): Promise<void> {
        return this.endedPromise!;
    }
}
