import java.util.Collections;
import java.util.LinkedList;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static int startNum = 0;
    static int endNum = 10000;
    static int threadsN = 5;

    public static void main(String[] args) throws InterruptedException {
        PrimeFinder pf = new PrimeFinder();
        pf.currNum = startNum + 1;
        if(startNum < 2 && endNum > 2) pf.addPrime(2);

        Thread[] threads = new Thread[threadsN];
        for(int i = 0; i < threadsN; i++) {
            threads[i] = new Thread(() -> {
                int checkNum;
                while((checkNum = pf.getCurrNum()) < endNum) {
                    checkIfPrime(checkNum, pf);
                }
            });
        }
        for(Thread thread : threads) thread.start();
        for(Thread thread : threads) thread.join();

        Collections.sort(pf.primes);
        StringBuilder out = new StringBuilder();
        for(int p : pf.primes) out.append(p).append(" ");
        System.out.println(out);
        System.out.println("Number of primes: " + pf.primes.size());
    }

    static void checkIfPrime(int checkNum, PrimeFinder pf) {
        if(checkNum == 1) return;
        for(int j = (checkNum/2)+1; j>1; j--) {
            if(checkNum%j==0) return;
        }
        pf.addPrime(checkNum);
    }
}

class PrimeFinder {
    ReentrantLock lock = new ReentrantLock();
    LinkedList<Integer> primes = new LinkedList<>();
    int currNum;

    int getCurrNum() {
        lock.lock();
        try {
            currNum++;
            return currNum - 1;
        }finally {
            lock.unlock();
        }
    }

    void addPrime(int prime) {
        lock.lock();
        try {
            primes.add(prime);

        }finally {
            lock.unlock();
        }
    }
}
