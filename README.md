# Employee Management Backoffice - Angular 18

Mini project Technical Assessment Backoffice Frontend dengan domain **Employee Management**.

## Environment

- Node.js: disarankan 20.x LTS
- Angular CLI: 18.x
- Angular: 18.2.x
- Package manager: npm

## Fitur

- Login page dengan hardcoded credential dan validasi fungsional.
- Employee list dengan 100+ dummy data.
- Paging, sorting, searching dengan rule AND.
- Pilihan jumlah data per halaman.
- Add employee form dengan validasi mandatory.
- Birth date memakai datetime-local dan tidak boleh melebihi hari ini.
- Email validation.
- Basic salary hanya angka.
- Dropdown group dengan search textbox dan 10 dummy group.
- Employee detail dengan format salary Rupiah.
- Tombol OK kembali ke list tanpa menghapus state search sebelumnya.
- Responsive web design.

## Login Dummy

```txt
username: admin
password: admin123
```

## Cara Menjalankan

```bash
npm install
npm start
```

Lalu buka:

```txt
http://localhost:4200
```

## Build Production

```bash
npm run build
```

## Struktur Folder

```txt
src/app/core        # model, guard, service
src/app/features    # halaman login, list, add, detail
src/app/layout      # shell layout setelah login
src/styles.css      # global responsive styling
```

## Catatan Deliverable

Nama project dan repository jangan menyertakan kata yang dilarang di soal assessment. Project ini sengaja memakai dummy data lokal agar mudah direview tanpa backend.
