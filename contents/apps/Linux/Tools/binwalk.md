# Binwalk (v3)

> https://github.com/ReFirmLabs/binwalk
What does it do?
Binwalk can identify, and optionally extract, files and data that have been embedded inside of other files.

While its primary focus is firmware analysis, it supports a wide variety of file and data types.

Through entropy analysis, it can even help to identify unknown compression or encryption!

Binwalk can be customized and integrated into your own Rust projects.


## 使用 `binwalk` 列出二进制文件中包含的各个文件
```sh
binwalk <filename>

# example output
--------------------------------------------------------------------------------------------------------------
DECIMAL                            HEXADECIMAL                        DESCRIPTION
--------------------------------------------------------------------------------------------------------------
1024                               0x400                             POSIX tar archive, file count: 16
--------------------------------------------------------------------------------------------------------------

Analyzed 1 file for 85 file signatures (187 magic patterns) in 79.0 milliseconds
```


## 使用 `binwalk` 提取文件
```sh
binwalk -e <filename>
```
输出路径: `./extractions/<filename>.extracted/`
