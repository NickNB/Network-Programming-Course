import java.util.ArrayList;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Workers workerThreads = new Workers(4);
        Workers eventLoop = new Workers(1);

        workerThreads.post(() -> {
            System.out.println("task 1: hello!");
            for(int i = 0; i < 10000000; i++); //simulating some work
            System.out.println("task 1: good bye!");
        });

        workerThreads.post(() -> {
            System.out.println("task 2: hello!");
            System.out.println("task 2: bye!");
        });

        workerThreads.postTimeout(() -> {
            System.out.println("task 3: I had a 2 second timeout!");
        }, 2000);

        eventLoop.post(() -> System.out.println("event task 1: hello!"));
        eventLoop.post(() -> System.out.println("event task 2: hello!"));


        Thread.sleep(10000);    //waits 10 seconds
        workerThreads.stop();   //stops workerThreads after 10 seconds
        eventLoop.stop();   //stops eventLoop after 10 seconds
    }
}

class Workers {
    boolean running = true;
    Thread[] threads;
    ArrayList<Runnable> tasks = new ArrayList<>();

    private final ReentrantLock mutex = new ReentrantLock();

    public Workers(int n) {
        threads = new Thread[n];
        for(int i = 0; i < n; i++) {
            threads[i] = new Thread(this::run);
            threads[i].start();
        }
    }

    void run() {
        Runnable task;
        try {
            while (running) {
                mutex.lock();
                if (tasks.size() > 0) {
                    task = tasks.get(0);
                    tasks.remove(0);
                    mutex.unlock();

                    task.run();
                } else {
                    mutex.unlock();
                    synchronized (this) {
                        wait();
                    }
                }
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    void post(Runnable task) {
        mutex.lock();
        tasks.add(task);
        mutex.unlock();

        synchronized (this) {
            notify();
        }
    }

    void postTimeout(Runnable task, int milliSec) {
        new Thread(() -> {
            try {
                Thread.sleep(milliSec);
                mutex.lock();
                tasks.add(task);
                mutex.unlock();

                synchronized (this) {
                    notify();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }

    void stop() throws InterruptedException {
        running = false;
        synchronized (this) {
            notifyAll();
        }
        for(Thread t : threads) t.join();
    }
}