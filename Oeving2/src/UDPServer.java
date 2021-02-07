import java.io.IOException;
import java.net.*;

public class UDPServer {
    static boolean running = true;

    public static void main(String[] args) throws IOException {
        DatagramSocket s = new DatagramSocket(5000);
        byte[] buffer = new byte[1024];

        while(running) {
            DatagramPacket packet = new DatagramPacket(new byte[128], 128);
            s.receive(packet);
            String input = new String(packet.getData()).trim();
            System.out.println("client input: " + input);

            if(input.contentEquals("start")) {
                String msg = "Send a calculation formatted like 2 + 4 or 5 - 3";
                packet = new DatagramPacket(msg.getBytes(), msg.length(), packet.getAddress(), packet.getPort());
                s.send(packet);
            } else if(input.contentEquals("exit")) {
                s.close();
                running = false;
            } else {
                String res = calculate(new String(packet.getData()).trim().split(" "));
                packet = new DatagramPacket(res.getBytes(), res.length(), packet.getAddress(), packet.getPort());
                s.send(packet);
            }
        }
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

        return switch (calc[1]) {
            case "+" -> "Answer: " + (num1 + num2);
            case "-" -> "Answer: " + (num1 - num2);
            default -> "Could not do the calculation because the operator is invalid";
        };
    }
}
