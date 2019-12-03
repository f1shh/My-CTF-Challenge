from selenium import webdriver
import MySQLdb
from selenium.common.exceptions import NoAlertPresentException
from urlparse import urlparse

chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--no-sandbox')
client = webdriver.Chrome(chrome_options = chrome_options, executable_path = '/root/chromedriver')
client.set_page_load_timeout(5)
client.set_script_timeout(5)
while 1:
    try:
        db = MySQLdb.connect("localhost", "root", "root", "d3guestbook")
        cursor = db.cursor()
        cursor.execute("SELECT id, url FROM urls WHERE viewed = 0")
        results = cursor.fetchall()
        cursor.close()
        for row in results:
            url = row[1]
            u = 'http://' + urlparse(url).netloc
            client.get(u)
            client.add_cookie({'name': 'sessid', 'value': 's:0MaXiMkJrHCNbANUOCwrGa5qjk0S-YMb.59/4j0+F+Oekor/KGUkqOvWC/wpPgLZtj2jYJFDGESg', 'path': '/'})
            client.get("http://example.org")
            client.get(url)
            while 1:
                try:
                    client.switch_to_alert().accept()
                except NoAlertPresentException:
                    break
            cursor = db.cursor()
            cursor.execute("UPDATE urls SET viewed = 1 WHERE id = {}".format(str(row[0])))
            db.commit()
            db.close()
    except Exception as e:
        print "[error] " + str(e)