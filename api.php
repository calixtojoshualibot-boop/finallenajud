<?php
// backend/api.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$db_file = 'database.json';

// Initialize DB if not exists
if (!file_exists($db_file)) {
    $initialData = [
        "users" => [
            ["id" => "admin1", "email" => "admin@caps.ph", "password" => password_hash("admin123", PASSWORD_DEFAULT), "role" => "admin", "name" => "Admin"]
        ],
        "caps" => [
            ["id" => "1", "name" => "Bulls Dynasty Snapback", "team" => "Chicago Bulls", "year" => 1996, "condition" => "near-mint", "price" => 18000, "description" => "Original 96 Championship era Bulls snapback.", "image" => "bulls", "featured" => true],
            ["id" => "2", "name" => "Lakers Showtime Fitted", "team" => "Los Angeles Lakers", "year" => 1988, "condition" => "excellent", "price" => 25000, "description" => "Purple and gold fitted from the Showtime era.", "image" => "lakers", "featured" => true]
        ],
        "orders" => [],
        "contact" => [
            "shopName" => "Caps Vault Manila",
            "ownerName" => "Juan Dela Cruz",
            "phone" => "+63 917 123 4567",
            "email" => "seller@capsvault.ph",
            "address" => "Makati City, Metro Manila",
            "facebook" => "facebook.com/capsvaultmanila",
            "instagram" => "@capsvaultmanila",
            "messengerUsername" => "capsvaultmanila",
            "bio" => "Collector of authentic vintage NBA caps."
        ]
    ];
    file_put_contents($db_file, json_encode($initialData, JSON_PRETTY_PRINT));
}

function get_db() {
    global $db_file;
    return json_decode(file_get_contents($db_file), true);
}

function save_db($data) {
    global $db_file;
    file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$resource = $request[0] ?? '';
$id = $request[1] ?? null;

$data = get_db();

switch ($resource) {
    case 'register':
        if ($method == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $input['id'] = (string)time();
            $input['password'] = password_hash($input['password'], PASSWORD_DEFAULT);
            $input['role'] = 'user'; // Default role
            $data['users'][] = $input;
            save_db($data);
            unset($input['password']);
            echo json_encode($input);
        }
        break;

    case 'login':
        if ($method == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            foreach ($data['users'] as $user) {
                if ($user['email'] === $input['email'] && password_verify($input['password'], $user['password'])) {
                    unset($user['password']);
                    echo json_encode($user);
                    exit;
                }
            }
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
        }
        break;

    case 'caps':
        if ($method == 'GET') {
            echo json_encode($data['caps']);
        } elseif ($method == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $input['id'] = (string)time();
            $data['caps'][] = $input;
            save_db($data);
            echo json_encode($input);
        } elseif ($method == 'PUT' && $id) {
            $input = json_decode(file_get_contents('php://input'), true);
            foreach ($data['caps'] as &$cap) {
                if ($cap['id'] == $id) {
                    $cap = array_merge($cap, $input);
                    echo json_encode($cap);
                    break;
                }
            }
            save_db($data);
        } elseif ($method == 'DELETE' && $id) {
            $data['caps'] = array_filter($data['caps'], function($c) use ($id) { return $c['id'] != $id; });
            $data['caps'] = array_values($data['caps']);
            save_db($data);
            http_response_code(204);
        }
        break;

    case 'contact':
        if ($method == 'GET') {
            echo json_encode($data['contact']);
        } elseif ($method == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $data['contact'] = $input;
        save_db($data);
        echo json_encode($data['contact']);
    }
    break;

case 'orders':
    if ($method == 'GET') {
        echo json_encode($data['orders']);
    } elseif ($method == 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $input['id'] = (string)time();
        $input['date'] = date('Y-m-d H:i:s');
        $data['orders'][] = $input;
        save_db($data);
        echo json_encode($input);
    } elseif ($method == 'PUT' && $id) {
        $input = json_decode(file_get_contents('php://input'), true);
        foreach ($data['orders'] as &$order) {
            if ($order['id'] == $id) {
                $order = array_merge($order, $input);
                echo json_encode($order);
                break;
            }
        }
        save_db($data);
    }
    break;

case 'users':
    if ($method == 'GET') {
        $users = $data['users'];
        foreach($users as &$u) unset($u['password']);
        echo json_encode($users);
    }
    break;

default:
        http_response_code(404);
        echo json_encode(["error" => "Resource not found"]);
        break;
}
?>
