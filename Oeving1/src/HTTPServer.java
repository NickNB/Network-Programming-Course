import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.LinkedBlockingDeque;

public class HTTPServer {
    public static void main(String[] args) throws IOException {
        ServerSocket ss = new ServerSocket(80);
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

        StringBuilder response =
                new StringBuilder("HTTP/1.0 200 OK\n" +
                        "Content-Type: text/html; charset=utf-8\n" +
                        "\n" +
                        "<HTML><BODY>" +
                        "<h1>Hei fra serveren. Her er headeren du sendte:</h1>\n" +
                        "<UL>\n");
        String line;
        while((line = reader.readLine()) != null && !(line.contentEquals(""))) {
            response.append("<LI>").append(line).append("</LI>\n");
        }
        response.append("</UL>\n" + "</BODY></HTML>\n");
        writer.println(response);

        writer.close();
        s.close();
    }
}