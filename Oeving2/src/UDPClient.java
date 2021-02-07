import java.io.IOException;
import java.net.*;
import java.util.Scanner;

public class UDPClient {
    public static void main(String[] args) throws IOException {
        DatagramSocket s = new DatagramSocket();
        InetAddress addr = InetAddress.getByName("localhost");
        Scanner in = new Scanner(System.in);

        boolean running = true;
        byte[] start = "start".getBytes();
        DatagramPacket packet = new DatagramPacket(start, start.length, addr, 5000);
        s.send(packet);

        packet = new DatagramPacket(new byte[128], 128);
        s.receive(packet);
        System.out.println(new String(packet.getData()));

        while(running) {

            byte[] buffer = in.nextLine().getBytes();
            packet = new DatagramPacket(buffer, buffer.length, addr, 5000);
            s.send(packet);
            if(new String(buffer).trim().equals("exit")) break;

            packet = new DatagramPacket(new byte[128], 128);
            s.receive(packet);
            System.out.println(new String(packet.getData()));
        }
    }
}
