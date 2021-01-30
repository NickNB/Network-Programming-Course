import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.LinkedBlockingDeque;

public class Server {
    public static void main(String[] args) throws IOException {
        ServerSocket ss = new ServerSocket(5000);
        LinkedBlockingDeque<Socket> sockets = new LinkedBlockingDeque<>();

        while(true) {
            sockets.add(ss.accept());
            new Thread(() -> {
                Socket s = sockets.poll();

                System.out.println("connection!");

                try {
                    handleInput(s);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }

    static void handleInput(Socket s) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(s.getInputStream()));
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(s.getOutputStream()), true);

        writer.println("connection made");
        String line;
        while(true) {
            writer.println("Insert a calculation formatted like this: 4 + 5 or 3 - 2\n");
            if((line = reader.readLine()) == null || line.contentEquals("exit!")) break;
            writer.println(calculate(line.split(" ")));
        }
        writer.close();
        s.close();
        if(line != null && line.contentEquals("exit!")) System.exit(0);
    }

    static String calculate(String[] calc) {
        double num1;
        double num2;

        try {
            if(calc.length != 3) throw new NumberFormatException();
            num1 = Integer.parseInt(calc[0]);
            num2 = Integer.parseInt(calc[2]);
        }catch (NumberFormatException e) {
            return "Could not do the calculation because one of the numbers was invalid";
        }

        switch(calc[1]) {
            case "+":
                return "Answer: " + (num1 + num2);
            case "-":
                return "Answer: " + (num1 - num2);
            default:
                return "Could not do the calculation because the operator is invalid";
        }
    }
}