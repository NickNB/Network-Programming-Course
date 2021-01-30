import java.io.*;
import java.net.Socket;
import java.util.Scanner;

public class Klient {
    public static void main(String[] args) throws IOException {
        Scanner in = new Scanner(System.in);
        Socket s = new Socket("localhost", 5000);

        BufferedReader reader = new BufferedReader(new InputStreamReader(s.getInputStream()));
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(s.getOutputStream()), true);
        String response;
        while ((response = reader.readLine()) != null && !(response.contentEquals(""))) {
            System.out.println(response);
        }

        while (true) {
            String line = in.nextLine();
            if (line.contentEquals("exit")) break;
            writer.println(line);
            while ((response = reader.readLine()) != null && !(response.contentEquals(""))) {
                System.out.println(response);
            }
            if (response == null) break;
        }

        in.close();
        writer.close();
        s.close();
        System.out.println("exiting");
    }
}